from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ────────────────────────────────────────────────
#  RIDE CRUD
# ────────────────────────────────────────────────
class RideCreate(BaseModel):
    user_id: int
    bike_id: int
    start_station_id: Optional[int] = None
    end_station_id: Optional[int] = None
    distance: Optional[float] = None


class RideUpdate(BaseModel):
    end_station_id: Optional[int] = None
    end_time: Optional[datetime] = None
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
    distance_km: Optional[float] = None  # alias para compatibilidad con la app móvil

    @property
    def distance_km(self):
        return self.distance

    class Config:
        from_attributes = True


# ────────────────────────────────────────────────
#  GPS POINTS
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
#  START RIDE
# ────────────────────────────────────────────────
class StartRideRequest(BaseModel):
    user_id: int
    bike_id: int
    latitude: Optional[float] = None   # posición de inicio del usuario
    longitude: Optional[float] = None


class StartRideResponse(BaseModel):
    ride: RideOut
    message: str


# ────────────────────────────────────────────────
#  END RIDE
# ────────────────────────────────────────────────
class EndRideRequest(BaseModel):
    ride_id: int
    latitude: float   # Posición final del usuario
    longitude: float


class NearestStationInfo(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    distance_km: float

    class Config:
        from_attributes = True


class EndRideResponse(BaseModel):
    ride: RideOut
    nearest_station: NearestStationInfo
    total_distance_km: float
    km_added_to_bike: float
    duration_minutes: float
    calories_burned: float  # Calorías quemadas en el viaje (usando peso promedio 70kg)
    message: str
