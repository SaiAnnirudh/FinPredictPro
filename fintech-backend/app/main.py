from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.external.real_stock_fetcher import RealStockDataFetcher
from app.config import settings
from app.api.v1.routes.predictions_real import router as pred_router
from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.watchlist import router as watchlist_router
from app.api.v1.routes.calendar_routes import router as calendar_router
from app.api.v1.routes.settings import router as settings_router
from app.api.v1.routes.analytics import router as analytics_router
from app.db.models import Base
from app.db.database import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FinPredict Pro API")
stock_fetcher = RealStockDataFetcher(settings.ALPHA_VANTAGE_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pred_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(watchlist_router, prefix="/api/v1")
app.include_router(calendar_router, prefix="/api/v1")
app.include_router(settings_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/v1/stocks/{symbol}")
async def get_stock(symbol: str):
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
    logger.info(f"Fetching historical data for {symbol}...")
    df = await stock_fetcher.yf_client.get_historical_data(symbol, days)
    if df is None:
        return {"error": "Historical data not found"}
    
    # ensure dates are formatted cleanly for JSON response
    df['date'] = df['date'].dt.strftime('%Y-%m-%d %H:%M:%S')
    data = df.to_dict('records')
    return {
        "symbol": symbol,
        "days": days,
        "data": data,
        "source": "real_data"
    }
