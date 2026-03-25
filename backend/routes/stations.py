from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.dependencies import get_db
from core.security import get_current_user, get_current_admin
import schemas.stations as schemas
import services.stations as services

router = APIRouter(tags=["Stations"])


@router.get("/stations", response_model=list[schemas.StationOut])
def get_stations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """Devuelve todas las estaciones. Público (necesario para el mapa)."""
    return services.get_stations(db, skip=skip, limit=limit)


@router.post("/stations", response_model=schemas.StationOut)
def create_station(
    data: schemas.StationCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    """Crea una estación. Solo administradores."""
    return services.create_station(db, data)


@router.put("/stations/{station_id}", response_model=schemas.StationOut)
def update_station(
    station_id: int,
    data: schemas.StationCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    """Actualiza una estación. Solo administradores."""
    return services.update_station(db, station_id, data)


@router.delete("/stations/{station_id}")
def delete_station(
    station_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    """Elimina una estación. Solo administradores."""
    return services.delete_station(db, station_id)
