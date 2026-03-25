import uuid
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from models.bikes import Bike, Maintenance
from models.rides import Ride
import schemas.bikes as schemas
from services.qr import generate_bike_qr, get_qr_filepath


def create_bike(db: Session, data: schemas.BikeCreate):
    # Generar código UUID único
    bike_code = str(uuid.uuid4())

    new_bike = Bike(
        code=bike_code,
        status=data.status,
        station_id=data.station_id,
        latitude=data.latitude,
        longitude=data.longitude,
        max_km=data.max_km if data.max_km is not None else 500,
    )
    db.add(new_bike)
    db.commit()
    db.refresh(new_bike)

    # Generar QR ahora que tenemos el ID
    qr_relative_path = generate_bike_qr(new_bike.id)
    new_bike.qr_path = qr_relative_path
    db.commit()
    db.refresh(new_bike)

    return new_bike


def get_bikes(db: Session):
    return db.query(Bike).all()


def get_bike(db: Session, bike_id: int):
    b = db.query(Bike).filter(Bike.id == bike_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bicicleta no encontrada")
    return b


def update_bike(db: Session, bike_id: int, data: schemas.BikeUpdate):
    b = db.query(Bike).filter(Bike.id == bike_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bicicleta no encontrada")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(b, key, value)
    db.commit()
    db.refresh(b)
    return b


def delete_bike(db: Session, bike_id: int):
    b = db.query(Bike).filter(Bike.id == bike_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Bicicleta no encontrada")
    db.delete(b)
    db.commit()
    return {"message": "Bicicleta eliminada"}


def get_bike_qr_path(bike_id: int) -> str:
    """Devuelve la ruta absoluta al archivo QR del bike_id dado."""
    filepath = get_qr_filepath(bike_id)
    if not filepath:
        raise HTTPException(status_code=404, detail="QR no encontrado para esta bicicleta")
    return filepath


def create_maintenance(db: Session, data: schemas.MaintenanceCreate):
    m = Maintenance(**data.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


def get_maintenance(db: Session):
    return db.query(Maintenance).all()


def get_bike_history(db: Session, bike_id: int) -> dict:
    """
    Devuelve el historial completo de viajes de una bicicleta.
    Relación: Bike → Ride → User
    """
    bike = db.query(Bike).filter(Bike.id == bike_id).first()
    if not bike:
        raise HTTPException(status_code=404, detail="Bicicleta no encontrada")

    rides = (
        db.query(Ride)
        .options(joinedload(Ride.user))
        .filter(Ride.bike_id == bike_id)
        .order_by(Ride.start_time.desc())
        .all()
    )

    history = []
    for ride in rides:
        history.append({
            "ride_id": ride.id,
            "user": ride.user,
            "start_time": ride.start_time,
            "end_time": ride.end_time,
            "distance_km": ride.distance,
            "start_station_id": ride.start_station_id,
            "end_station_id": ride.end_station_id,
        })

    return {
        "bike_id": bike.id,
        "bike_code": bike.code,
        "total_km": round(bike.total_km or 0, 4),
        "total_rides": len(rides),
        "rides": history,
    }
