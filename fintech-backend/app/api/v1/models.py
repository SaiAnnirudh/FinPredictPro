from pydantic import BaseModel

class PredictionResponse(BaseModel):
    symbol: str
    currentPrice: float
    prediction: float
    daysAhead: int
    confidence: float
    change: float
    changePercent: float
    model: str
    source: str
