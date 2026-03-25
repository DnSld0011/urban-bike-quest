from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.stations import Station
import schemas.stations as schemas

def create_station(db: Session, data: schemas.StationCreate):
    new_station = Station(**data.model_dump())
    db.add(new_station)
    db.commit()
    db.refresh(new_station)
    return new_station

def get_stations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Station).offset(skip).limit(limit).all()

def update_station(db: Session, station_id: int, data: schemas.StationCreate):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Estación no encontrada")
    for key, value in data.model_dump().items():
        setattr(station, key, value)
    db.commit()
    db.refresh(station)
    return station

def delete_station(db: Session, station_id: int):
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Estación no encontrada")
    db.delete(station)
    db.commit()
    return {"message": "Estación eliminada"}
