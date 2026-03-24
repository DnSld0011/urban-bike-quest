from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ────────────────────────────────────────────────
#  AUTH
# ────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


# ────────────────────────────────────────────────
#  ROLES
# ────────────────────────────────────────────────
class RoleCreate(BaseModel):
    name: str


class RoleOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


# ────────────────────────────────────────────────
#  USERS
# ────────────────────────────────────────────────
class UserCreate(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    dni: Optional[str] = None
    password: str
    role_id: Optional[int] = None


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    address: Optional[str]
    dni: Optional[str]
    role_id: Optional[int]

    class Config:
        from_attributes = True


# ────────────────────────────────────────────────
#  STATIONS
# ────────────────────────────────────────────────
class StationCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    capacity: int


class StationOut(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    capacity: int

    class Config:
        from_attributes = True


# ────────────────────────────────────────────────
#  BIKES
# ────────────────────────────────────────────────
class BikeCreate(BaseModel):
    code: str
    status: Optional[str] = "available"


class BikeOut(BaseModel):
    id: int
    code: str
    status: str
    total_km: float
    last_maintenance_km: float
    needs_maintenance: bool

    class Config:
        from_attributes = True


# ────────────────────────────────────────────────
#  RIDES
# ────────────────────────────────────────────────
class RideCreate(BaseModel):
    user_id: int
    bike_id: int
    start_station_id: Optional[int] = None
    end_station_id: Optional[int] = None
    distance: Optional[float] = None


class RideOut(BaseModel):
    id: int
    user_id: int
    bike_id: int
    start_station_id: Optional[int]
    end_station_id: Optional[int]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    distance: Optional[float]

    class Config:
        from_attributes = True


# ────────────────────────────────────────────────
#  GPS RIDE POINTS
# ────────────────────────────────────────────────
class RidePointCreate(BaseModel):
    ride_id: int
    latitude: float
    longitude: float


class RidePointOut(BaseModel):
    id: int
    ride_id: int
    latitude: float
    longitude: float
    timestamp: Optional[datetime]

    class Config:
        from_attributes = True


# ────────────────────────────────────────────────
#  MAINTENANCE
# ────────────────────────────────────────────────
class MaintenanceCreate(BaseModel):
    bike_id: int
    description: Optional[str] = None
    km_at_service: Optional[float] = None


class MaintenanceOut(BaseModel):
    id: int
    bike_id: int
    date: Optional[datetime]
    description: Optional[str]
    km_at_service: Optional[float]

    class Config:
        from_attributes = True


# ────────────────────────────────────────────────
#  WEATHER
# ────────────────────────────────────────────────
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


# ────────────────────────────────────────────────
#  EVENTS
# ────────────────────────────────────────────────
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


# ────────────────────────────────────────────────
#  PREDICTIONS
# ────────────────────────────────────────────────
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