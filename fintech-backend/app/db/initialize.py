import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.db.models import Base, Stock, HistoricalPrice, User
from app.external.real_stock_fetcher import RealStockDataFetcher
from app.config import settings
from app.utils.security import get_password_hash

def init_db():
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    
    stocks_to_add = [
        {"symbol": "RELIANCE.NS", "name": "Reliance Industries", "sector": "Energy"},
        {"symbol": "TCS.NS", "name": "Tata Consultancy Services", "sector": "IT"},
        {"symbol": "HDFCBANK.NS", "name": "HDFC Bank", "sector": "Banking"},
        {"symbol": "INFY.NS", "name": "Infosys", "sector": "IT"},
        {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever", "sector": "FMCG"},
    ]
    
    with Session(engine) as session:
        # Create default user
        test_email = "test@predict.com"
        default_user = session.query(User).filter(User.email == test_email).first()
        if not default_user:
            default_user = User(
                email=test_email,
                hashed_password=get_password_hash("password123")
            )
            session.add(default_user)
            session.commit()
            print("✅ Default test user created (test@predict.com / password123)")

        for stock_data in stocks_to_add:
            stock = session.query(Stock).filter(Stock.symbol == stock_data["symbol"]).first()
            if not stock:
                session.add(Stock(**stock_data))
        session.commit()
    print("✅ Database initialized")

async def fetch_historical_to_db():
    fetcher = RealStockDataFetcher(settings.ALPHA_VANTAGE_KEY)
    engine = create_engine(settings.DATABASE_URL)
    stocks = ["RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"]
    
    with Session(engine) as session:
        for symbol in stocks:
            print(f"Fetching historical data for {symbol}...")
            df = await fetcher.yf_client.get_historical_data(symbol, days=365)
            if df is None:
                continue
            
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
            print(f"✅ Stored records for {symbol}")

if __name__ == "__main__":
    init_db()
    asyncio.run(fetch_historical_to_db())
