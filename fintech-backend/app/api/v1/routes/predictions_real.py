from fastapi import APIRouter, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from tensorflow.keras.models import load_model
import xgboost as xgb
import numpy as np
import pickle
import pandas as pd
from app.api.v1.models import PredictionResponse
from app.db.models import HistoricalPrice, Stock
from app.config import settings
from app.external.real_stock_fetcher import RealStockDataFetcher
from app.ml.training.quick_train_xgboost import train_xgboost_model
from app.ml.training.quick_train_lstm import train_lstm_model
from sqlalchemy import create_engine
import logging
from sklearn.preprocessing import MinMaxScaler

logger = logging.getLogger(__name__)
router = APIRouter()

loaded_models = {}

def get_lstm_model(symbol: str):
    key = f"{symbol}_lstm"
    if key not in loaded_models:
        try:
            path = f"app/ml/models/saved/{symbol}_lstm_model.h5"
            loaded_models[key] = load_model(path, compile=False)
        except Exception as e:
            return None
    return loaded_models[key]

def get_xgb_model(symbol: str):
    key = f"{symbol}_xgb"
    if key not in loaded_models:
        try:
            path = f"app/ml/models/saved/{symbol}_xgb_model.pkl"
            with open(path, 'rb') as f:
                loaded_models[key] = pickle.load(f)
        except Exception as e:
            return None
    return loaded_models[key]

async def fetch_missing_historical_data(symbol: str, session: Session):
    fetcher = RealStockDataFetcher(settings.ALPHA_VANTAGE_KEY)
    df = await fetcher.yf_client.get_historical_data(symbol, days=365)
    if df is None or df.empty:
        return False
        
    stock = session.query(Stock).filter(Stock.symbol == symbol).first()
    if not stock:
        # Add basic record for stock
        quote = await fetcher.fetch_and_cache(symbol)
        name = quote.get("name", symbol) if quote else symbol
        session.add(Stock(symbol=symbol, name=name, sector="Unknown"))

    for _, row in df.iterrows():
        existing = session.query(HistoricalPrice).filter(
            HistoricalPrice.symbol == symbol, 
            HistoricalPrice.date == row['date']
        ).first()
        if not existing:
            price = HistoricalPrice(
                symbol=symbol,
                date=row['date'],
                open=row['open'],
                high=row['high'],
                low=row['low'],
                close=row['close'],
                volume=row['volume']
            )
            session.add(price)
    session.commit()
    return True

@router.post("/real-predictions/{symbol}", response_model=PredictionResponse)
async def predict_real(symbol: str, background_tasks: BackgroundTasks, days_ahead: int = 7):
    logger.info(f"Generating real prediction for {symbol}")
    try:
        engine = create_engine(settings.DATABASE_URL)
        with Session(engine) as session:
            prices = session.query(HistoricalPrice).filter(
                HistoricalPrice.symbol == symbol
            ).order_by(HistoricalPrice.date.desc()).limit(100).all()
            
            if len(prices) < 60:
                logger.info(f"Not enough historical data for {symbol}. Fetching now...")
                success = await fetch_missing_historical_data(symbol, session)
                if not success:
                    raise HTTPException(status_code=404, detail="Could not fetch historical data for this symbol.")
                # Re-query
                prices = session.query(HistoricalPrice).filter(
                    HistoricalPrice.symbol == symbol
                ).order_by(HistoricalPrice.date.desc()).limit(100).all()
        
        close_prices = np.array([p.close for p in reversed(prices)])
        current_price = close_prices[-1]
        
        xgb_model = get_xgb_model(symbol)
        if not xgb_model:
            logger.info(f"No XGBoost model found for {symbol}. Training on-the-fly...")
            xgb_model = train_xgboost_model(symbol)
            if xgb_model:
                loaded_models[f"{symbol}_xgb"] = xgb_model
        
        lstm_model = get_lstm_model(symbol)
        if not lstm_model:
            logger.info(f"No LSTM model found for {symbol}. Adding to background tasks...")
            background_tasks.add_task(train_lstm_model, symbol)
        
        if not lstm_model and not xgb_model:
            raise HTTPException(status_code=500, detail="Models could not be loaded or trained.")

        prediction_val = 0
        model_name = "Ensemble"
        
        lstm_pred = None
        if lstm_model:
            scaler = MinMaxScaler()
            scaled = scaler.fit_transform(close_prices.reshape(-1, 1))
            prediction_input = scaled[-60:].reshape(1, 60, 1)
            lstm_scaled_pred = lstm_model.predict(prediction_input, verbose=0)[0][0]
            lstm_pred = scaler.inverse_transform([[lstm_scaled_pred]])[0][0]
            prediction_val = float(lstm_pred)
            model_name = "LSTM"

        xgb_pred = None
        if xgb_model:
            returns = np.diff(close_prices) / close_prices[:-1]
            lookback = 10
            lags = []
            for i in range(lookback, 0, -1):
                lags.append(returns[-i])
            
            xgb_ret_pred = xgb_model.predict(np.array([lags]))[0]
            xgb_pred = current_price * (1 + xgb_ret_pred)
            prediction_val = float(xgb_pred)
            model_name = "XGBoost"

        if lstm_pred is not None and xgb_pred is not None:
            prediction_val = float((lstm_pred + xgb_pred) / 2)
            model_name = "LSTM + XGBoost Ensemble"

        recent_returns = np.diff(close_prices[-20:]) / close_prices[-20:-1]
        volatility = np.std(recent_returns)
        confidence = max(0.5, min(1.0, 1 - volatility))
        
        return {
            "symbol": symbol,
            "currentPrice": float(current_price),
            "prediction": prediction_val,
            "daysAhead": days_ahead,
            "confidence": float(confidence),
            "change": float(prediction_val - current_price),
            "changePercent": float((prediction_val - current_price) / current_price * 100),
            "model": model_name,
            "source": "real_model"
        }
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
