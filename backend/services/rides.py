from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.rides import Ride, RidePoint
from models.bikes import Bike
from models.stations import Station
import schemas.rides as schemas
from services.geo import find_nearest_station, distance_to_station, haversine
from services.alerts import create_maintenance_alert


# ──────────────────────────────────────────────────
#  START RIDE
# ──────────────────────────────────────────────────
def start_ride(db: Session, data: schemas.StartRideRequest) -> dict:
    """
    Inicia un nuevo viaje:
    1. Valida que bike exista y esté disponible.
    2. Valida que user exista.
    3. Detecta estación más cercana a la posición de inicio (si se proveen coords).
    4. Crea el Ride y marca la bici como 'in_use'.
    """
    from models.users import User  # importación local para evitar ciclos

    # Validaciones
    bike = db.query(Bike).filter(Bike.id == data.bike_id).first()
    if not bike:
        raise HTTPException(status_code=404, detail="Bicicleta no encontrada")
    if bike.status == "in_use":
        raise HTTPException(status_code=400, detail="La bicicleta ya está en uso")
    if bike.status == "maintenance":
        raise HTTPException(status_code=400, detail="La bicicleta está en mantenimiento")

    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Estación de inicio más cercana (opcional)
    start_station_id = None
    if data.latitude and data.longitude:
        stations = db.query(Station).all()
        nearest = find_nearest_station(data.latitude, data.longitude, stations)
        if nearest:
            start_station_id = nearest.id

    # Crear viaje
    new_ride = Ride(
        user_id=data.user_id,
        bike_id=data.bike_id,
        start_station_id=start_station_id,
        start_time=datetime.utcnow(),
    )
    db.add(new_ride)

    # Marcar bici en uso y actualizar su ubicación
    bike.status = "in_use"
    if data.latitude and data.longitude:
        bike.latitude = data.latitude
        bike.longitude = data.longitude

    db.commit()
    db.refresh(new_ride)

    return {
        "ride": new_ride,
        "message": f"Viaje #{new_ride.id} iniciado. Bicicleta {bike.code[:8]}... en uso.",
    }


# ──────────────────────────────────────────────────
#  TRACKING GPS
# ──────────────────────────────────────────────────
def add_point(db: Session, data: schemas.RidePointCreate):
    """Guarda un punto GPS del recorrido en tiempo real."""
    ride = db.query(Ride).filter(Ride.id == data.ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    if ride.end_time is not None:
        raise HTTPException(status_code=400, detail="El viaje ya fue finalizado")

    new_point = RidePoint(
        ride_id=data.ride_id,
        latitude=data.latitude,
        longitude=data.longitude,
        timestamp=datetime.utcnow(),
    )
    db.add(new_point)
    db.commit()
    db.refresh(new_point)
    return new_point


def get_points(db: Session, ride_id: int):
    return db.query(RidePoint).filter(RidePoint.ride_id == ride_id).all()


# ──────────────────────────────────────────────────
#  END RIDE
# ──────────────────────────────────────────────────
def _calculate_total_distance(points: list) -> float:
    """
    Suma la distancia Haversine entre puntos GPS consecutivos.
    Devuelve distancia total en kilómetros.
    """
    if len(points) < 2:
        return 0.0
    total = 0.0
    for i in range(len(points) - 1):
        total += haversine(
            points[i].latitude, points[i].longitude,
            points[i + 1].latitude, points[i + 1].longitude,
        )
    return round(total, 4)


def end_ride(db: Session, data: schemas.EndRideRequest) -> dict:
    """
    Finaliza un viaje activo:
    1. Valida viaje abierto.
    2. Calcula distancia total a partir de los puntos GPS guardados.
    3. Detecta la estación más cercana al punto final.
    4. Cierra viaje: end_time, end_station_id, distance.
    5. Actualiza bicicleta: status='available', total_km, station_id, lat/lon.
       Si total_km >= max_km → needs_maintenance = True.
    """
    # 1. Validar viaje
    ride = db.query(Ride).filter(Ride.id == data.ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    if ride.end_time is not None:
        raise HTTPException(status_code=400, detail="El viaje ya fue finalizado")

    # 2. Calcular distancia total con los puntos GPS
    points = db.query(RidePoint).filter(RidePoint.ride_id == data.ride_id).all()
    total_km = _calculate_total_distance(points)

    # Si no hay suficientes puntos, usamos Haversine directo start→end
    if total_km == 0.0 and ride.start_station_id:
        start_station = db.query(Station).filter(Station.id == ride.start_station_id).first()
        if start_station:
            total_km = round(haversine(
                start_station.latitude, start_station.longitude,
                data.latitude, data.longitude
            ), 4)

    # 3. Estación más cercana al punto final
    stations = db.query(Station).all()
    nearest = find_nearest_station(data.latitude, data.longitude, stations)
    if not nearest:
        raise HTTPException(status_code=404, detail="No hay estaciones registradas")
    dist_to_station_km = distance_to_station(data.latitude, data.longitude, nearest)

    # 4. Calcular duración
    end_time = datetime.utcnow()
    duration_minutes = round((end_time - ride.start_time).total_seconds() / 60, 1)

    # 5. Cerrar viaje
    ride.end_time = end_time
    ride.end_station_id = nearest.id
    ride.distance = total_km

    # 6. Actualizar bicicleta
    bike = db.query(Bike).filter(Bike.id == ride.bike_id).first()
    if bike:
        bike.status = "available"
        bike.station_id = nearest.id
        bike.latitude = data.latitude
        bike.longitude = data.longitude
        bike.total_km = (bike.total_km or 0) + total_km

        # Detectar si la bici necesita mantenimiento y generar alerta automática
        if bike.max_km and bike.total_km >= bike.max_km:
            bike.needs_maintenance = True
            create_maintenance_alert(db, bike)   # ← alerta automática

    db.commit()
    db.refresh(ride)

    return {
        "ride": ride,
        "nearest_station": {
            "id": nearest.id,
            "name": nearest.name,
            "latitude": nearest.latitude,
            "longitude": nearest.longitude,
            "distance_km": round(dist_to_station_km, 4),
        },
        "total_distance_km": total_km,
        "km_added_to_bike": total_km,
        "duration_minutes": duration_minutes,
        "message": (
            f"Viaje finalizado en {duration_minutes} min. "
            f"{total_km} km recorridos. "
            f"Bicicleta asignada a '{nearest.name}' "
            f"a {round(dist_to_station_km * 1000):.0f} m."
        ),
    }


# ──────────────────────────────────────────────────
#  CRUD RIDES
# ──────────────────────────────────────────────────
def create_ride(db: Session, data: schemas.RideCreate):
    new_ride = Ride(**data.model_dump())
    db.add(new_ride)
    bike = db.query(Bike).filter(Bike.id == data.bike_id).first()
    if bike:
        bike.status = "in_use"
    db.commit()
    db.refresh(new_ride)
    return new_ride


def get_rides(db: Session):
    return db.query(Ride).all()


def get_ride(db: Session, ride_id: int):
    ride = db.query(Ride).filter(Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Recorrido no encontrado")
    return ride


def update_ride(db: Session, ride_id: int, data: schemas.RideUpdate):
    r = db.query(Ride).filter(Ride.id == ride_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    update_data = data.model_dump(exclude_unset=True)
    if "end_time" in update_data or "end_station_id" in update_data:
        bike = db.query(Bike).filter(Bike.id == r.bike_id).first()
        if bike:
            bike.status = "available"
    for key, value in update_data.items():
        setattr(r, key, value)
    db.commit()
    db.refresh(r)
    return r


def delete_ride(db: Session, ride_id: int):
    r = db.query(Ride).filter(Ride.id == ride_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Viaje no encontrado")
    db.delete(r)
    db.commit()
    return {"message": "Viaje eliminado"}
