import asyncio
from app.external.alpha_vantage import AlphaVantageClient
from app.external.yahoo_finance import YahooFinanceClient
import logging

logger = logging.getLogger(__name__)

class RealStockDataFetcher:
    def __init__(self, av_key: str):
        self.av_client = AlphaVantageClient(av_key)
        self.yf_client = YahooFinanceClient()
    
    async def fetch_and_cache(self, symbol: str) -> dict:
        try:
            data = await self.av_client.get_quote(symbol)
            if data:
                return data
        except Exception as e:
            logger.warning(f"Alpha Vantage failed: {e}")
        
        try:
            data = self.yf_client.get_quote(symbol)
            if data:
                return data
        except Exception as e:
            logger.error(f"Yahoo Finance failed: {e}")
        
        return None
