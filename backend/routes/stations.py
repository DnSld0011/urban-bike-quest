from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.dependencies import get_db
import schemas.stations as schemas
import services.stations as services

router = APIRouter(tags=["Stations"])

@router.post("/stations", response_model=schemas.StationOut)
def create_station(data: schemas.StationCreate, db: Session = Depends(get_db)):
    return services.create_station(db, data)

@router.get("/stations", response_model=list[schemas.StationOut])
def get_stations(db: Session = Depends(get_db)):
    return services.get_stations(db)

@router.put("/stations/{station_id}", response_model=schemas.StationOut)
def update_station(station_id: int, data: schemas.StationCreate, db: Session = Depends(get_db)):
    return services.update_station(db, station_id, data)

@router.delete("/stations/{station_id}")
def delete_station(station_id: int, db: Session = Depends(get_db)):
    return services.delete_station(db, station_id)
