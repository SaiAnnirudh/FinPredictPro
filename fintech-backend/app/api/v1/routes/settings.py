from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.db.models import User, UserSetting
from app.api.v1.schemas import UserSettingUpdate, UserSettingResponse

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("", response_model=UserSettingResponse)
def get_settings(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    settings = current_user.settings
    if not settings:
        # Create default settings if none exist
        settings = UserSetting(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("", response_model=UserSettingResponse)
def update_settings(update_data: UserSettingUpdate, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    settings = current_user.settings
    if not settings:
        settings = UserSetting(user_id=current_user.id)
        db.add(settings)
    
    update_dict = update_data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(settings, key, value)
        
    db.commit()
    db.refresh(settings)
    return settings
