# FinPredict Pro: Quick-Start Implementation Guide

## Phase 1: Local Development Setup (1-2 weeks)

### Week 1: Backend Foundation & Real API Integration

#### Day 1-2: Project Setup

```bash
# Create project structure
mkdir fintech-backend && cd fintech-backend

# Create Python virtual environment
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Create directory structure
mkdir -p app/{api/v1/routes,services,ml/{models,training,evaluation},external,db,middleware,utils}
touch app/__init__.py app/main.py app/config.py app/dependencies.py

# Install dependencies
pip install fastapi uvicorn python-dotenv sqlalchemy psycopg2-binary redis aiohttp

# Create requirements.txt
pip freeze > requirements.txt
```

#### Day 2-3: Configure Alpha Vantage & Yahoo Finance

```python
# .env (keep this secret!)
ALPHA_VANTAGE_KEY=demo  # Get from https://www.alphavantage.co/
ENVIRONMENT=development
DATABASE_URL=sqlite:///./test.db
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-change-in-production

# Test API connection
python
>>> from app.external.alpha_vantage import AlphaVantageClient
>>> client = AlphaVantageClient("demo")
>>> import asyncio
>>> data = asyncio.run(client.get_quote("RELIANCE.NS"))
>>> print(data)
```

#### Day 3-4: Real Stock Data Integration

```python
# app/external/real_stock_fetcher.py
import asyncio
from app.external.alpha_vantage import AlphaVantageClient
from app.external.yahoo_finance import YahooFinanceClient
import pandas as pd
import logging

logger = logging.getLogger(__name__)

class RealStockDataFetcher:
    """Fetch real stock data from multiple sources"""
    
    def __init__(self, av_key: str):
        self.av_client = AlphaVantageClient(av_key)
        self.yf_client = YahooFinanceClient()
    
    async def fetch_and_cache(self, symbol: str) -> dict:
        """Fetch latest stock data"""
        # Try Alpha Vantage first
        try:
            data = await self.av_client.get_quote(symbol)
            if data:
                print(f"✅ Fetched {symbol} from Alpha Vantage")
                return data
        except Exception as e:
            logger.warning(f"Alpha Vantage failed: {e}")
        
        # Fallback to Yahoo Finance
        try:
            data = self.yf_client.get_quote(symbol)
            if data:
                print(f"✅ Fetched {symbol} from Yahoo Finance")
                return data
        except Exception as e:
            logger.error(f"Yahoo Finance failed: {e}")
        
        return None

# Test script
async def test_real_data():
    fetcher = RealStockDataFetcher("demo")
    
    # Test Indian stocks
    stocks = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"]
    for symbol in stocks:
        data = await fetcher.fetch_and_cache(symbol)
        if data:
            print(f"{symbol}: ₹{data['price']} ({data['changePercent']}%)")

if __name__ == "__main__":
    asyncio.run(test_real_data())
```

Run this script:
```bash
python app/external/real_stock_fetcher.py
```

Expected output:
```
✅ Fetched RELIANCE.NS from Yahoo Finance
RELIANCE.NS: ₹2847.50 (+1.23%)
TCS.NS: ₹3456.80 (-0.45%)
HDFCBANK.NS: ₹1650.25 (+2.10%)
```

#### Day 4-5: FastAPI Server with Real Data Endpoints

```python
# app/main.py (simplified for quick start)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.external.real_stock_fetcher import RealStockDataFetcher
from app.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="FinPredict Pro API")

# Initialize stock fetcher
stock_fetcher = RealStockDataFetcher(settings.ALPHA_VANTAGE_KEY)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/v1/stocks/{symbol}")
async def get_stock(symbol: str):
    """Get real stock data"""
    logger.info(f"Fetching {symbol}...")
    data = await stock_fetcher.fetch_and_cache(symbol)
    
    if not data:
        return {"error": "Stock not found"}
    
    return {
        "symbol": data["symbol"],
        "price": data["price"],
        "change": data["change"],
        "changePercent": data["changePercent"],
        "volume": data["volume"],
        "source": "real_data"
    }

@app.get("/api/v1/stocks/{symbol}/historical")
async def get_historical(symbol: str, days: int = 30):
    """Get historical data"""
    logger.info(f"Fetching historical data for {symbol}...")
    
    df = await stock_fetcher.yf_client.get_historical_data(symbol, days)
    
    if df is None:
        return {"error": "Historical data not found"}
    
    # Convert to list of dicts
    data = df.to_dict('records')
    
    return {
        "symbol": symbol,
        "days": days,
        "data": data,
        "source": "real_data"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

Run the server:
```bash
python -m uvicorn app.main:app --reload
```

Test endpoints:
```bash
# Get stock quote
curl http://localhost:8000/api/v1/stocks/RELIANCE.NS

# Get historical data
curl http://localhost:8000/api/v1/stocks/RELIANCE.NS/historical?days=30
```

#### Day 5-7: Database Setup with Real Data

```python
# app/db/initialize.py
import asyncio
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.db.models import Base, Stock, HistoricalPrice
from app.external.real_stock_fetcher import RealStockDataFetcher
from app.config import settings

def init_db():
    """Initialize database with real data"""
    
    # Create tables
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    
    # Add popular Indian stocks
    stocks_to_add = [
        {"symbol": "RELIANCE.NS", "name": "Reliance Industries", "sector": "Energy"},
        {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "sector": "IT"},
        {"symbol": "HDFCBANK.NS", "name": "HDFC Bank", "sector": "Banking"},
        {"symbol": "INFY.NS", "name": "Infosys", "sector": "IT"},
        {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever", "sector": "FMCG"},
    ]
    
    with Session(engine) as session:
        for stock_data in stocks_to_add:
            stock = Stock(**stock_data)
            session.merge(stock)  # Use merge to avoid duplicates
        session.commit()
    
    print(f"✅ Added {len(stocks_to_add)} stocks to database")

async def fetch_historical_to_db():
    """Fetch and store historical data"""
    fetcher = RealStockDataFetcher("demo")
    engine = create_engine(settings.DATABASE_URL)
    
    stocks = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"]
    
    with Session(engine) as session:
        for symbol in stocks:
            print(f"Fetching historical data for {symbol}...")
            df = await fetcher.yf_client.get_historical_data(symbol, days=365)
            
            if df is None:
                continue
            
            for _, row in df.iterrows():
                price = HistoricalPrice(
                    symbol=symbol,
                    date=row['date'],
                    open=row['open'],
                    high=row['high'],
                    low=row['low'],
                    close=row['close'],
                    volume=row['volume']
                )
                session.merge(price)
            
            session.commit()
            print(f"✅ Stored {len(df)} records for {symbol}")

if __name__ == "__main__":
    init_db()
    asyncio.run(fetch_historical_to_db())
```

Run:
```bash
python app/db/initialize.py
```

### Week 2: ML Models with Real Data

#### Day 1-3: Train LSTM Model

```python
# app/ml/training/quick_train_lstm.py
import pandas as pd
import numpy as np
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
    """Train LSTM on real historical data"""
    
    logger.info(f"Training LSTM for {symbol}...")
    
    # Get historical data from DB
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
    
    # Prepare data
    from sklearn.preprocessing import MinMaxScaler
    
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_prices = scaler.fit_transform(df[['close']])
    
    # Create sequences
    X, y = [], []
    for i in range(len(scaled_prices) - lookback):
        X.append(scaled_prices[i:i+lookback])
        y.append(scaled_prices[i+lookback])
    
    X = np.array(X)
    y = np.array(y)
    
    # Split
    train_size = int(0.8 * len(X))
    X_train, X_test = X[:train_size], X[train_size:]
    y_train, y_test = y[:train_size], y[train_size:]
    
    # Build model
    model = Sequential([
        LSTM(units=64, activation='relu', input_shape=(lookback, 1)),
        Dropout(0.2),
        Dense(units=32, activation='relu'),
        Dense(units=1)
    ])
    
    model.compile(optimizer=Adam(learning_rate=0.001), loss='mse')
    
    # Train
    logger.info("Training model...")
    model.fit(X_train, y_train, epochs=50, batch_size=32, verbose=1)
    
    # Evaluate
    test_loss = model.evaluate(X_test, y_test, verbose=0)
    logger.info(f"Test Loss: {test_loss:.4f}")
    
    # Save
    model_path = f"ml/models/saved/{symbol}_lstm_model.h5"
    model.save(model_path)
    logger.info(f"✅ Model saved to {model_path}")
    
    return model

# Quick train multiple stocks
if __name__ == "__main__":
    import os
    os.makedirs("ml/models/saved", exist_ok=True)
    
    stocks = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"]
    for symbol in stocks:
        try:
            train_lstm_model(symbol)
        except Exception as e:
            logger.error(f"Error training {symbol}: {e}")
```

Run:
```bash
python app/ml/training/quick_train_lstm.py
```

#### Day 3-5: Integrate Models into API

```python
# app/api/v1/routes/predictions_real.py
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from tensorflow.keras.models import load_model
import numpy as np
from app.api.v1.models import PredictionResponse
from app.db.models import HistoricalPrice, Prediction
from app.config import settings
from sqlalchemy import create_engine
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Cache loaded models
loaded_models = {}

def get_model(symbol: str):
    """Load model with caching"""
    if symbol not in loaded_models:
        try:
            path = f"ml/models/saved/{symbol}_lstm_model.h5"
            loaded_models[symbol] = load_model(path)
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return None
    return loaded_models[symbol]

@router.post("/real-predictions/{symbol}", response_model=PredictionResponse)
async def predict_real(symbol: str, days_ahead: int = 7):
    """
    Get real predictions from actual ML model.
    
    Real workflow:
    1. Get historical data from database
    2. Load trained LSTM model
    3. Prepare features
    4. Run inference
    5. Return predictions with confidence
    """
    
    logger.info(f"Generating real prediction for {symbol}")
    
    try:
        # Get historical data
        engine = create_engine(settings.DATABASE_URL)
        with Session(engine) as session:
            prices = session.query(HistoricalPrice).filter(
                HistoricalPrice.symbol == symbol
            ).order_by(HistoricalPrice.date.desc()).limit(60).all()
        
        if not prices:
            raise HTTPException(status_code=404, detail="No historical data")
        
        # Prepare for model
        close_prices = np.array([p.close for p in reversed(prices)])
        
        # Normalize (same as training)
        from sklearn.preprocessing import MinMaxScaler
        scaler = MinMaxScaler()
        scaled = scaler.fit_transform(close_prices.reshape(-1, 1))
        
        # Get model
        model = get_model(symbol)
        if not model:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        # Predict
        prediction_input = scaled[-60:].reshape(1, 60, 1)
        lstm_pred = model.predict(prediction_input, verbose=0)[0][0]
        lstm_pred = scaler.inverse_transform([[lstm_pred]])[0][0]
        
        # Calculate confidence based on recent volatility
        recent_returns = np.diff(close_prices[-20:]) / close_prices[-20:-1]
        volatility = np.std(recent_returns)
        confidence = max(0.5, min(1.0, 1 - volatility))
        
        current_price = close_prices[-1]
        
        return {
            "symbol": symbol,
            "currentPrice": float(current_price),
            "prediction": float(lstm_pred),
            "daysAhead": days_ahead,
            "confidence": float(confidence),
            "change": float(lstm_pred - current_price),
            "changePercent": float((lstm_pred - current_price) / current_price * 100),
            "model": "LSTM (Real)",
            "source": "real_model"
        }
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Add to main.py router
# from app.api.v1.routes.predictions_real import router as pred_router
# app.include_router(pred_router, prefix="/api/v1")
```

Test the real prediction:
```bash
curl http://localhost:8000/api/v1/real-predictions/RELIANCE.NS?days_ahead=7
```

Expected response:
```json
{
  "symbol": "RELIANCE.NS",
  "currentPrice": 2847.50,
  "prediction": 2920.45,
  "daysAhead": 7,
  "confidence": 0.87,
  "change": 72.95,
  "changePercent": 2.56,
  "model": "LSTM (Real)",
  "source": "real_model"
}
```

### Phase 2: Frontend Integration (1 week)

#### Update Frontend API Client

```typescript
// src/api/stockApi.ts
export const fetchRealPrediction = async (symbol: string, daysAhead: number = 7) => {
  const { data } = await apiClient.post(
    `/predictions/real-predictions/${symbol}?days_ahead=${daysAhead}`
  );
  return data;
};

// Use in component
export const useRealPrediction = (symbol: string) => {
  return useQuery({
    queryKey: ['prediction-real', symbol],
    queryFn: () => fetchRealPrediction(symbol),
    enabled: !!symbol,
  });
};
```

#### Update UI Component

```typescript
// src/components/PredictionDisplay.tsx (updated)
import { useRealPrediction } from '@/api/stockApi';
import { useStock } from '@/hooks/useStock';

export const PredictionDisplay = ({ symbol }: { symbol: string }) => {
  const { data: stock } = useStock(symbol);
  const { data: prediction, isLoading } = useRealPrediction(symbol);
  
  if (isLoading) return <div>Generating real prediction...</div>;
  if (!prediction) return <div>No prediction available</div>;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-500">Current Price</p>
          <p className="text-2xl font-bold">₹{prediction.currentPrice}</p>
        </div>
        <div>
          <p className="text-gray-500">Predicted Price (7d)</p>
          <p className="text-2xl font-bold">₹{prediction.prediction}</p>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded">
        <p className="text-sm font-semibold">Confidence: {(prediction.confidence * 100).toFixed(1)}%</p>
        <p className={prediction.changePercent > 0 ? 'text-green-600' : 'text-red-600'}>
          {prediction.changePercent > 0 ? '+' : ''}{prediction.changePercent.toFixed(2)}%
        </p>
      </div>
      
      <p className="text-xs text-gray-500">Model: {prediction.model}</p>
    </div>
  );
};
```

### Phase 3: Deployment (1 week)

#### Docker Setup

```dockerfile
# Dockerfile (backend)
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential curl && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p ml/models/saved

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Deploy Backend to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
railway init

# Add PostgreSQL
railway add

# Push code
git push origin main

# View logs
railway logs
```

#### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add REACT_APP_API_URL
# Enter: https://your-railway-api.railway.app/api
```

---

## Testing Your Full-Stack Implementation

### Test 1: Real Stock Data Flow

```python
# test_full_flow.py
import asyncio
import requests
import time

async def test_full_flow():
    BASE_URL = "http://localhost:8000/api/v1"
    
    print("1️⃣ Testing real stock data...")
    resp = requests.get(f"{BASE_URL}/stocks/RELIANCE.NS")
    stock = resp.json()
    print(f"✅ Got stock: ₹{stock['price']}")
    
    print("\n2️⃣ Testing real historical data...")
    resp = requests.get(f"{BASE_URL}/stocks/RELIANCE.NS/historical?days=60")
    historical = resp.json()
    print(f"✅ Got {len(historical['data'])} days of historical data")
    
    print("\n3️⃣ Testing ML prediction...")
    resp = requests.post(f"{BASE_URL}/real-predictions/RELIANCE.NS")
    prediction = resp.json()
    print(f"✅ Got prediction: ₹{prediction['prediction']} (confidence: {prediction['confidence']})")
    
    print("\n✨ Full-stack flow working!")

if __name__ == "__main__":
    asyncio.run(test_full_flow())
```

Run:
```bash
python test_full_flow.py
```

### Test 2: Frontend Integration

```bash
# In frontend directory
npm run dev

# Visit http://localhost:5173
# Select a stock and verify:
# 1. Real price loads from API ✅
# 2. Real prediction appears ✅
# 3. Confidence score shows ✅
# 4. Historical chart renders ✅
```

---

## Production URLs Example

Once deployed:

**Frontend:**
- https://finpredict-pro.vercel.app

**Backend API:**
- https://finpredict-pro-api.railway.app/api/v1/stocks/RELIANCE.NS
- https://finpredict-pro-api.railway.app/api/v1/real-predictions/RELIANCE.NS

**API Documentation:**
- https://finpredict-pro-api.railway.app/docs (Swagger UI)
- https://finpredict-pro-api.railway.app/redoc (ReDoc)

---

## Troubleshooting

### Issue: "Model not found"
```bash
# Solution: Train models first
python app/ml/training/quick_train_lstm.py
```

### Issue: "Database connection failed"
```bash
# Solution: Check DATABASE_URL in .env
# For local: sqlite:///./test.db
# For production: postgresql://user:pass@host/db
```

### Issue: "API CORS errors"
```python
# Solution: Update CORS in main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: "Alpha Vantage rate limit exceeded"
```python
# Solution: Use demo key for development
# For production, get free/premium key from https://www.alphavantage.co/
# Fallback to Yahoo Finance automatically
```

---

## Next Steps

1. ✅ Local development working
2. ✅ Real APIs integrated
3. ✅ ML models training and predicting
4. ⬜ Add more models (XGBoost, Random Forest)
5. ⬜ Add backtesting metrics
6. ⬜ Add user authentication
7. ⬜ Add portfolio tracking
8. ⬜ Add alerts and notifications
9. ⬜ Add advanced technical indicators
10. ⬜ Deploy to production

---

## Estimated Timeline

- **Phase 1 (Backend & Real Data):** 1-2 weeks
- **Phase 2 (Frontend Integration):** 3-4 days
- **Phase 3 (Deployment):** 2-3 days
- **Total:** ~3-4 weeks for full production-ready app

Good luck! 🚀
