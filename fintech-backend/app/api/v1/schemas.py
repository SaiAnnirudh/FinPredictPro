from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    is_active: bool
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Watchlist Schemas ---
class WatchlistCreate(BaseModel):
    symbol: str

class WatchlistResponse(BaseModel):
    id: int
    symbol: str
    added_at: datetime
    class Config:
        orm_mode = True

# --- Calendar Schemas ---
class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: datetime
    event_type: str

class CalendarEventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    event_date: datetime
    event_type: str
    class Config:
        orm_mode = True

# --- Settings Schemas ---
class UserSettingUpdate(BaseModel):
    theme: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    risk_tolerance: Optional[str] = None

class UserSettingResponse(BaseModel):
    theme: str
    notifications_enabled: bool
    risk_tolerance: str
    class Config:
        orm_mode = True
