from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.dependencies import get_db, get_current_active_user
from app.db.models import User, Prediction, WatchlistItem

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary")
def get_analytics_summary(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    total_predictions = db.query(func.count(Prediction.id)).scalar() or 0
    watchlist_count = db.query(func.count(WatchlistItem.id)).filter(WatchlistItem.user_id == current_user.id).scalar() or 0
    active_models = db.query(func.count(func.distinct(Prediction.model_name))).scalar() or 0
    
    # Fallback to 2 active models (LSTM, XGBoost) if no predictions exist yet
    if active_models == 0:
        active_models = 2
        
    return {
        "total_predictions": total_predictions,
        "watchlist_count": watchlist_count,
        "active_models": active_models,
        "pending_analysis": 0
    }
