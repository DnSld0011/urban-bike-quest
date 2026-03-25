from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class WeatherCreate(BaseModel):
    date: datetime
    temperature: Optional[float] = None
    condition: Optional[str] = None


class WeatherOut(BaseModel):
    id: int
    date: datetime
    temperature: Optional[float]
    condition: Optional[str]

    class Config:
        from_attributes = True


class EventCreate(BaseModel):
    name: str
    location: Optional[str] = None
    date: datetime


class EventOut(BaseModel):
    id: int
    name: str
    location: Optional[str]
    date: datetime

    class Config:
        from_attributes = True


class PredictionCreate(BaseModel):
    station_id: int
    predicted_bikes: int
    date: datetime


class PredictionOut(BaseModel):
    id: int
    station_id: int
    predicted_bikes: Optional[int]
    date: datetime

    class Config:
        from_attributes = True


class SettingCreate(BaseModel):
    key: str
    value: str
    description: Optional[str] = None


class SettingUpdate(BaseModel):
    value: str


class SettingOut(BaseModel):
    id: int
    key: str
    value: str
    description: Optional[str]

    class Config:
        from_attributes = True


# ────────────────────────────────────────────────
#  ALERTAS
# ────────────────────────────────────────────────
class AlertOut(BaseModel):
    id: int
    bike_id: int
    message: str
    resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True
