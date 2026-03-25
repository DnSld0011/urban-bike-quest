from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class BikeCreate(BaseModel):
    """Sólo se pasa el status inicial; el código UUID y el QR se autogeneran."""
    status: Optional[str] = "available"
    station_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_km: Optional[float] = 500


class BikeUpdate(BaseModel):
    status: Optional[str] = None
    station_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_km: Optional[float] = None
    max_km: Optional[float] = None
    last_maintenance_km: Optional[float] = None
    needs_maintenance: Optional[bool] = None


class BikeOut(BaseModel):
    id: int
    code: str
    status: str
    station_id: Optional[int]
    latitude: Optional[float]
    longitude: Optional[float]
    total_km: float
    max_km: float
    last_maintenance_km: float
    needs_maintenance: bool
    qr_path: Optional[str]

    class Config:
        from_attributes = True


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
#  HISTORIAL DE VIAJES
# ────────────────────────────────────────────────
class RideUserInfo(BaseModel):
    id: int
    full_name: str
    email: str

    class Config:
        from_attributes = True


class BikeRideHistoryItem(BaseModel):
    ride_id: int
    user: RideUserInfo
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    distance_km: Optional[float]
    start_station_id: Optional[int]
    end_station_id: Optional[int]

    class Config:
        from_attributes = True


class BikeHistoryOut(BaseModel):
    bike_id: int
    bike_code: str
    total_km: float
    total_rides: int
    rides: List[BikeRideHistoryItem]
