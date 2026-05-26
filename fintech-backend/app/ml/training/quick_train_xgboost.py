import pandas as pd
import numpy as np
import os
import pickle
import xgboost as xgb
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.db.models import HistoricalPrice
from app.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_xgboost_model(symbol: str, lookback: int = 10):
    logger.info(f"Training XGBoost for {symbol}...")
    engine = create_engine(settings.DATABASE_URL)
    
    with Session(engine) as session:
        prices = session.query(HistoricalPrice).filter(
            HistoricalPrice.symbol == symbol
        ).order_by(HistoricalPrice.date).all()
        
        df = pd.DataFrame([
            {
                'date': p.date,
                'close': p.close,
            }
            for p in prices
        ])
    
    if len(df) < lookback + 10:
        logger.error(f"Not enough data.")
        return None
    
    # Feature engineering for XGBoost
    df['returns'] = df['close'].pct_change()
    for i in range(1, lookback + 1):
        df[f'lag_{i}'] = df['returns'].shift(i)
        
    df.dropna(inplace=True)
    
    features = [f'lag_{i}' for i in range(1, lookback + 1)]
    # Target is return of the next day
    df['target'] = df['returns'].shift(-1)
    df.dropna(inplace=True)
    
    X = df[features].values
    y = df['target'].values
    
    train_size = int(0.8 * len(X))
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]
    
    model = xgb.XGBRegressor(n_estimators=100, learning_rate=0.05, max_depth=3)
    model.fit(X_train, y_train)
    
    model_dir = "app/ml/models/saved"
    os.makedirs(model_dir, exist_ok=True)
    model_path = f"{model_dir}/{symbol}_xgb_model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    logger.info(f"✅ XGBoost Model saved to {model_path}")
    return model

if __name__ == "__main__":
    stocks = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"]
    for symbol in stocks:
        train_xgboost_model(symbol)
