import aiohttp

class AlphaVantageClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://www.alphavantage.co/query"

    async def get_quote(self, symbol: str) -> dict:
        async with aiohttp.ClientSession() as session:
            params = {
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": self.api_key
            }
            try:
                async with session.get(self.base_url, params=params) as response:
                    data = await response.json()
                    if "Global Quote" in data and data["Global Quote"]:
                        quote = data["Global Quote"]
                        return {
                            "symbol": quote.get("01. symbol"),
                            "price": float(quote.get("05. price", 0)),
                            "change": float(quote.get("09. change", 0)),
                            "changePercent": float(quote.get("10. change percent", "0").replace("%", "")),
                            "volume": int(quote.get("06. volume", 0))
                        }
                    return None
            except Exception:
                return None
