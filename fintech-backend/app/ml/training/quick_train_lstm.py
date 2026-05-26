import pandas as pd
import numpy as np
import os
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.db.models import HistoricalPrice
from app.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_lstm_model(symbol: str, lookback: int = 60):
    logger.info(f"Training LSTM for {symbol}...")
    engine = create_engine(settings.DATABASE_URL)
    
    with Session(engine) as session:
        prices = session.query(HistoricalPrice).filter(
            HistoricalPrice.symbol == symbol
        ).order_by(HistoricalPrice.date).all()
        
        df = pd.DataFrame([
            {
                'date': p.date,
                'close': p.close,
                'high': p.high,
                'low': p.low,
                'volume': p.volume
            }
            for p in prices
        ])
    
    if len(df) < lookback:
        logger.error(f"Not enough data. Need {lookback}, got {len(df)}")
        return None
    
    from sklearn.preprocessing import MinMaxScaler
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_prices = scaler.fit_transform(df[['close']])
    
    X, y = [], []
    for i in range(len(scaled_prices) - lookback):
        X.append(scaled_prices[i:i+lookback])
        y.append(scaled_prices[i+lookback])
    
    X = np.array(X)
    y = np.array(y)
    
    train_size = int(0.8 * len(X))
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]
    
    model = Sequential([
        LSTM(units=64, activation='relu', input_shape=(lookback, 1)),
        Dropout(0.2),
        Dense(units=32, activation='relu'),
        Dense(units=1)
    ])
    model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
    model.fit(X_train, y_train, epochs=20, batch_size=32, verbose=1)
    
    model_dir = "app/ml/models/saved"
    os.makedirs(model_dir, exist_ok=True)
    model_path = f"{model_dir}/{symbol}_lstm_model.h5"
    model.save(model_path)
    logger.info(f"✅ LSTM Model saved to {model_path}")
    return model

if __name__ == "__main__":
    stocks = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"]
    for symbol in stocks:
        train_lstm_model(symbol)
