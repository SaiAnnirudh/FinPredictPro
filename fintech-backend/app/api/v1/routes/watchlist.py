from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db, get_current_active_user
from app.db.models import User, WatchlistItem
from app.api.v1.schemas import WatchlistCreate, WatchlistResponse
from app.services.calendar_sync import sync_watchlist_events

router = APIRouter(prefix="/watchlist", tags=["watchlist"])

@router.get("", response_model=List[WatchlistResponse])
def get_watchlist(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return current_user.watchlist

@router.post("", response_model=WatchlistResponse)
def add_to_watchlist(item: WatchlistCreate, background_tasks: BackgroundTasks, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    existing = db.query(WatchlistItem).filter(WatchlistItem.user_id == current_user.id, WatchlistItem.symbol == item.symbol).first()
    if existing:
        raise HTTPException(status_code=400, detail="Stock already in watchlist")
    new_item = WatchlistItem(user_id=current_user.id, symbol=item.symbol)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    background_tasks.add_task(sync_watchlist_events, current_user.id, db)
    return new_item


@router.delete("/{symbol}")
def remove_from_watchlist(symbol: str, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    item = db.query(WatchlistItem).filter(WatchlistItem.user_id == current_user.id, WatchlistItem.symbol == symbol).first()
    if not item:
        raise HTTPException(status_code=404, detail="Stock not in watchlist")
    db.delete(item)
    db.commit()
    return {"message": "Successfully removed from watchlist"}
