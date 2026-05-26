import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

class YahooFinanceClient:
    def get_quote(self, symbol: str) -> dict:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.fast_info
            if info:
                current_price = info.get("lastPrice", 0)
                prev_close = info.get("previousClose", current_price)
                change = current_price - prev_close
                change_percent = (change / prev_close * 100) if prev_close else 0
                
                return {
                    "symbol": symbol,
                    "price": current_price,
                    "change": change,
                    "changePercent": change_percent,
                    "volume": info.get("lastVolume", 0)
                }
            return None
        except Exception:
            return None

    async def get_historical_data(self, symbol: str, days: int) -> pd.DataFrame:
        try:
            ticker = yf.Ticker(symbol)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            df = ticker.history(start=start_date, end=end_date)
            if not df.empty:
                df.reset_index(inplace=True)
                df.rename(columns={
                    'Date': 'date',
                    'Open': 'open',
                    'High': 'high',
                    'Low': 'low',
                    'Close': 'close',
                    'Volume': 'volume'
                }, inplace=True)
                df['date'] = df['date'].dt.tz_localize(None)
                return df
            return None
        except Exception:
            return None
