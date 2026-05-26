# FinPredict Pro: Ready-to-Use Code Snippets

## Table of Contents
1. [Backend Code Templates](#backend-code-templates)
2. [Frontend Code Templates](#frontend-code-templates)
3. [ML Training Scripts](#ml-training-scripts)
4. [Database Queries](#database-queries)
5. [Testing Code](#testing-code)

---

## Backend Code Templates

### 1. Basic FastAPI Setup with Real Data

**File: `app/main.py`**

```python
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from datetime import datetime
import yfinance as yf
from typing import Optional, List

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app with lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 FinPredict Pro API Starting...")
    yield
    logger.info("🛑 FinPredict Pro API Shutting down...")

app = FastAPI(
    title="FinPredict Pro API",
    description="Real-time stock predictions with ML",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://finpredict-pro.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
from pydantic import BaseModel

class StockResponse(BaseModel):
    symbol: str
    price: float
    change: float
    changePercent: float
    volume: int
    market_cap: Optional[str]
    timestamp: str

class PredictionResponse(BaseModel):
    symbol: str
    current_price: float
    predicted_price: float
    confidence: float
    days_ahead: int
    model: str

# Routes
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/v1/stocks/{symbol}", response_model=StockResponse)
async def get_stock(symbol: str):
    """Get real stock data from Yahoo Finance"""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        return StockResponse(
            symbol=symbol,
            price=float(info.get("currentPrice", 0)),
            change=float(info.get("regularMarketChange", 0)),
            changePercent=float(info.get("regularMarketChangePercent", 0)),
            volume=int(info.get("volume", 0)),
            market_cap=str(info.get("marketCap", "N/A")),
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        logger.error(f"Error fetching stock: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/v1/stocks/{symbol}/historical")
async def get_historical(
    symbol: str,
    days: int = Query(30, ge=1, le=365)
):
    """Get historical OHLCV data"""
    try:
        end = datetime.now()
        start = end - pd.Timedelta(days=days)
        
        df = yf.download(symbol, start=start, end=end, progress=False)
        
        data = []
        for idx, row in df.iterrows():
            data.append({
                "date": idx.strftime("%Y-%m-%d"),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": int(row["Volume"])
            })
        
        return {"symbol": symbol, "days": days, "data": data}
    except Exception as e:
        logger.error(f"Error fetching historical data: {e}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
```

**Run:**
```bash
pip install fastapi uvicorn yfinance pandas
python app/main.py
```

**Test:**
```bash
# Get stock
curl http://localhost:8000/api/v1/stocks/RELIANCE.NS

# Get historical
curl "http://localhost:8000/api/v1/stocks/RELIANCE.NS/historical?days=30"
```

### 2. ML Prediction Endpoint with Real Models

**File: `app/services/prediction_service.py`**

```python
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import load_model
import yfinance as yf
from datetime import datetime, timedelta
import logging
import os

logger = logging.getLogger(__name__)

class PredictionService:
    def __init__(self, models_path: str = "./ml/models"):
        self.models_path = models_path
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        self.lookback = 60
    
    def fetch_real_data(self, symbol: str, days: int = 365) -> pd.DataFrame:
        """Fetch real data from Yahoo Finance"""
        logger.info(f"Fetching real data for {symbol}...")
        end = datetime.now()
        start = end - timedelta(days=days)
        
        df = yf.download(symbol, start=start, end=end, progress=False)
        df = df[['Close']]
        df.columns = ['close']
        return df
    
    def prepare_data(self, df: pd.DataFrame) -> np.ndarray:
        """Prepare data for LSTM"""
        prices = df['close'].values.reshape(-1, 1)
        scaled = self.scaler.fit_transform(prices)
        
        # Create sequences
        X = []
        for i in range(len(scaled) - self.lookback):
            X.append(scaled[i:i+self.lookback])
        
        return np.array(X)
    
    def predict(self, symbol: str) -> dict:
        """Generate prediction using trained LSTM model"""
        try:
            # Fetch real data
            df = self.fetch_real_data(symbol, days=365)
            
            if len(df) < self.lookback:
                raise ValueError("Not enough historical data")
            
            # Prepare data
            X = self.prepare_data(df)
            
            # Load model
            model_path = os.path.join(self.models_path, f"{symbol}_lstm.h5")
            if not os.path.exists(model_path):
                logger.warning(f"Model not found for {symbol}, using fallback")
                return self._fallback_prediction(symbol, df)
            
            model = load_model(model_path)
            
            # Get last sequence
            last_sequence = X[-1:] if len(X) > 0 else None
            
            if last_sequence is None:
                return self._fallback_prediction(symbol, df)
            
            # Predict
            prediction_scaled = model.predict(last_sequence, verbose=0)[0][0]
            prediction = self.scaler.inverse_transform([[prediction_scaled]])[0][0]
            
            # Calculate confidence
            current_price = df['close'].iloc[-1]
            recent_volatility = df['close'].pct_change().std()
            confidence = max(0.5, min(0.95, 1 - recent_volatility * 2))
            
            return {
                "symbol": symbol,
                "current_price": float(current_price),
                "predicted_price": float(prediction),
                "confidence": float(confidence),
                "days_ahead": 7,
                "model": "LSTM",
                "source": "trained_model",
                "change": float(prediction - current_price),
                "change_percent": float((prediction - current_price) / current_price * 100)
            }
        
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return self._fallback_prediction(symbol, df)
    
    def _fallback_prediction(self, symbol: str, df: pd.DataFrame) -> dict:
        """Fallback prediction using simple trend"""
        current_price = df['close'].iloc[-1]
        
        # Simple 7-day trend
        recent_trend = (df['close'].iloc[-7:].mean() - df['close'].iloc[-30:].mean()) / df['close'].iloc[-30:].mean()
        predicted_price = current_price * (1 + recent_trend * 0.5)
        
        recent_volatility = df['close'].pct_change().std()
        confidence = max(0.5, 1 - recent_volatility * 2)
        
        return {
            "symbol": symbol,
            "current_price": float(current_price),
            "predicted_price": float(predicted_price),
            "confidence": float(confidence),
            "days_ahead": 7,
            "model": "Trend (Fallback)",
            "source": "fallback",
            "change": float(predicted_price - current_price),
            "change_percent": float((predicted_price - current_price) / current_price * 100)
        }

# Usage
@app.post("/api/v1/predictions/{symbol}")
async def get_prediction(symbol: str):
    """Get AI prediction for a stock"""
    service = PredictionService()
    prediction = service.predict(symbol)
    return prediction
```

---

## Frontend Code Templates

### 1. Real API Integration

**File: `src/api/client.ts`**

```typescript
import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
```

**File: `src/hooks/useStock.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';

export interface Stock {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  market_cap: string;
  timestamp: string;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const useStock = (symbol: string, enabled = true) => {
  return useQuery<Stock>({
    queryKey: ['stock', symbol],
    queryFn: async () => {
      const { data } = await client.get(`/stocks/${symbol}`);
      return data;
    },
    enabled: !!symbol && enabled,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
};

export const useHistoricalData = (symbol: string, days: number = 30) => {
  return useQuery<{ symbol: string; days: number; data: HistoricalData[] }>({
    queryKey: ['historical', symbol, days],
    queryFn: async () => {
      const { data } = await client.get(
        `/stocks/${symbol}/historical?days=${days}`
      );
      return data;
    },
    enabled: !!symbol,
  });
};
```

**File: `src/hooks/usePrediction.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import client from '@/api/client';

export interface Prediction {
  symbol: string;
  current_price: number;
  predicted_price: number;
  confidence: number;
  days_ahead: number;
  model: string;
  source: string;
  change: number;
  change_percent: number;
}

export const usePrediction = (symbol: string) => {
  return useQuery<Prediction>({
    queryKey: ['prediction', symbol],
    queryFn: async () => {
      const { data } = await client.post(`/predictions/${symbol}`);
      return data;
    },
    enabled: !!symbol,
  });
};
```

### 2. Real-Time Stock Chart Component

**File: `src/components/StockChart.tsx`**

```typescript
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useHistoricalData } from '@/hooks/useStock';
import { Loader2 } from 'lucide-react';

export const StockChart: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { data, isLoading, error } = useHistoricalData(symbol, 60);

  if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (error) return <div className="text-red-500">Error loading chart</div>;
  if (!data?.data) return <div>No data</div>;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="close"
          stroke="#3b82f6"
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
```

### 3. Prediction Card Component

**File: `src/components/PredictionCard.tsx`**

```typescript
import React from 'react';
import { usePrediction } from '@/hooks/usePrediction';
import { useStock } from '@/hooks/useStock';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

export const PredictionCard: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { data: stock, isLoading: stockLoading } = useStock(symbol);
  const { data: prediction, isLoading: predLoading } = usePrediction(symbol);

  const isLoading = stockLoading || predLoading;

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (!prediction) {
    return <div className="text-red-500">No prediction available</div>;
  }

  const isPositive = prediction.change_percent > 0;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{symbol} - 7 Day Prediction</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-600 text-sm">Current Price</p>
          <p className="text-2xl font-bold">₹{prediction.current_price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-600 text-sm">Predicted Price</p>
          <p className="text-2xl font-bold">₹{prediction.predicted_price.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white p-3 rounded mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Change</span>
          <span className={`flex items-center font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {isPositive ? '+' : ''}{prediction.change_percent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Confidence</span>
          <span className={`font-semibold ${prediction.confidence > 0.8 ? 'text-green-600' : prediction.confidence > 0.6 ? 'text-yellow-600' : 'text-red-600'}`}>
            {(prediction.confidence * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Model</span>
          <span className="font-semibold">{prediction.model}</span>
        </div>
      </div>
    </div>
  );
};
```

---

## ML Training Scripts

### 1. Train LSTM on Real Data

**File: `scripts/train_lstm.py`**

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
import yfinance as yf
import os
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def train_lstm_model(symbol: str, epochs: int = 100):
    """Train LSTM model on real stock data"""
    
    logger.info(f"Training LSTM for {symbol}...")
    
    # Fetch real data
    logger.info("Fetching real data from Yahoo Finance...")
    end = datetime.now()
    start = end - timedelta(days=365*2)  # 2 years of data
    
    df = yf.download(symbol, start=start, end=end, progress=False)
    prices = df['Close'].values.reshape(-1, 1)
    
    logger.info(f"Got {len(prices)} data points")
    
    # Normalize
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_prices = scaler.fit_transform(prices)
    
    # Create sequences
    lookback = 60
    X, y = [], []
    
    for i in range(len(scaled_prices) - lookback):
        X.append(scaled_prices[i:i+lookback])
        y.append(scaled_prices[i+lookback])
    
    X = np.array(X)
    y = np.array(y)
    
    logger.info(f"Created {len(X)} sequences")
    
    # Split data
    train_size = int(0.8 * len(X))
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]
    
    # Build model
    model = Sequential([
        LSTM(units=64, activation='relu', return_sequences=True, input_shape=(lookback, 1)),
        Dropout(0.2),
        LSTM(units=32, activation='relu'),
        Dropout(0.2),
        Dense(units=16, activation='relu'),
        Dense(units=1)
    ])
    
    model.compile(optimizer=Adam(learning_rate=0.001), loss='mse', metrics=['mae'])
    
    logger.info("Training...")
    model.fit(
        X_train, y_train,
        epochs=epochs,
        batch_size=32,
        validation_data=(X_test, y_test),
        verbose=1
    )
    
    # Evaluate
    test_loss = model.evaluate(X_test, y_test, verbose=0)
    logger.info(f"Test Loss: {test_loss:.4f}")
    
    # Save model
    os.makedirs("ml/models", exist_ok=True)
    model_path = f"ml/models/{symbol}_lstm.h5"
    model.save(model_path)
    logger.info(f"✅ Model saved to {model_path}")
    
    return model

if __name__ == "__main__":
    # Train for multiple stocks
    stocks = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS"]
    
    for symbol in stocks:
        try:
            train_lstm_model(symbol, epochs=50)
        except Exception as e:
            logger.error(f"Error training {symbol}: {e}")
```

**Run:**
```bash
pip install tensorflow pandas numpy scikit-learn yfinance
python scripts/train_lstm.py
```

---

## Database Queries

### 1. Store Predictions in Supabase

**File: `app/db/storage.py`**

```python
from supabase import create_client, Client
import os

class PredictionStorage:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        self.client: Client = create_client(url, key)
    
    def store_prediction(self, prediction: dict):
        """Store prediction in database"""
        data = {
            "symbol": prediction["symbol"],
            "current_price": prediction["current_price"],
            "predicted_price": prediction["predicted_price"],
            "confidence": prediction["confidence"],
            "model": prediction["model"],
            "source": prediction["source"],
            "created_at": datetime.now().isoformat()
        }
        
        response = self.client.table("predictions").insert(data).execute()
        return response
    
    def get_prediction_history(self, symbol: str, limit: int = 10):
        """Get past predictions for a symbol"""
        response = self.client.table("predictions")\
            .select("*")\
            .eq("symbol", symbol)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        
        return response.data
    
    def store_model_metrics(self, symbol: str, metrics: dict):
        """Store model performance metrics"""
        data = {
            "symbol": symbol,
            "mae": metrics.get("mae"),
            "rmse": metrics.get("rmse"),
            "r_squared": metrics.get("r_squared"),
            "model": metrics.get("model"),
            "created_at": datetime.now().isoformat()
        }
        
        response = self.client.table("model_metrics").insert(data).execute()
        return response
```

---

## Testing Code

### 1. Test All Endpoints

**File: `test_api.py`**

```python
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api/v1"

def test_stock_endpoint():
    """Test stock data endpoint"""
    print("Testing stock endpoint...")
    response = requests.get(f"{BASE_URL}/stocks/RELIANCE.NS")
    assert response.status_code == 200
    data = response.json()
    assert "symbol" in data
    assert "price" in data
    print(f"✅ Stock: {data['symbol']} - ₹{data['price']}")

def test_historical_endpoint():
    """Test historical data endpoint"""
    print("\nTesting historical endpoint...")
    response = requests.get(f"{BASE_URL}/stocks/RELIANCE.NS/historical?days=30")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) > 0
    print(f"✅ Got {len(data['data'])} days of historical data")

def test_prediction_endpoint():
    """Test prediction endpoint"""
    print("\nTesting prediction endpoint...")
    response = requests.post(f"{BASE_URL}/predictions/RELIANCE.NS")
    assert response.status_code == 200
    data = response.json()
    assert "predicted_price" in data
    assert "confidence" in data
    print(f"✅ Prediction: ₹{data['predicted_price']} (confidence: {data['confidence']:.2%})")

def run_all_tests():
    """Run all tests"""
    print("=" * 50)
    print("Running API Tests")
    print("=" * 50)
    
    try:
        test_stock_endpoint()
        test_historical_endpoint()
        test_prediction_endpoint()
        
        print("\n" + "=" * 50)
        print("✨ All tests passed!")
        print("=" * 50)
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    run_all_tests()
```

**Run:**
```bash
python test_api.py
```

---

## Environment Variables Template

**`.env` file:**

```bash
# Backend
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=sqlite:///./test.db
# For production: postgresql://user:password@localhost/fintech_db

# APIs
ALPHA_VANTAGE_KEY=demo
FINNHUB_KEY=your_key_here

# Frontend (in .env for React)
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_WS_URL=ws://localhost:8000/ws
```

---

## Docker Compose for Local Development

**`docker-compose.yml`:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: fintech
      POSTGRES_PASSWORD: fintech123
      POSTGRES_DB: fintech_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://fintech:fintech123@postgres:5432/fintech_db
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:8000/api/v1
    depends_on:
      - backend
    volumes:
      - ./frontend:/app

volumes:
  postgres_data:
```

**Run:**
```bash
docker-compose up
```

---

## Summary

You now have:

✅ **Real backend API** with stock data and predictions  
✅ **Real frontend** integration with hooks and components  
✅ **ML training scripts** for LSTM models  
✅ **Database storage** for predictions  
✅ **Testing suite** for all endpoints  
✅ **Docker setup** for local development  

**Next Steps:**
1. Copy these code snippets to your project
2. Install dependencies: `pip install -r requirements.txt` (backend) and `npm install` (frontend)
3. Train models: `python scripts/train_lstm.py`
4. Start backend: `python app/main.py`
5. Start frontend: `npm run dev`
6. Run tests: `python test_api.py`
7. Deploy to Vercel + Railway!
