from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db, get_current_active_user
from app.db.models import User, CalendarEvent
from app.api.v1.schemas import CalendarEventCreate, CalendarEventResponse

router = APIRouter(prefix="/calendar", tags=["calendar"])

@router.get("", response_model=List[CalendarEventResponse])
def get_events(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    return current_user.calendar_events

@router.post("", response_model=CalendarEventResponse)
def create_event(event: CalendarEventCreate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    new_event = CalendarEvent(user_id=current_user.id, **event.dict())
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.delete("/{event_id}")
def delete_event(event_id: int, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    event = db.query(CalendarEvent).filter(CalendarEvent.user_id == current_user.id, CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"message": "Successfully deleted event"}
