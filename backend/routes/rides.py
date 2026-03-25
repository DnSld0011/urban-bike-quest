from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.dependencies import get_db
from core.security import get_current_user
import schemas.rides as schemas
import services.rides as services

router = APIRouter(tags=["Rides"])


# ──────────────────────────────────────────────────
#  FLUJO PRINCIPAL (protegido)
# ──────────────────────────────────────────────────

@router.post("/start-ride", response_model=schemas.StartRideResponse)
def start_ride(
    data: schemas.StartRideRequest,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    """Inicia un viaje. Valida bici disponible, detecta estación inicial y marca bici en uso."""
    return services.start_ride(db, data)


@router.post("/ride-points", response_model=schemas.RidePointOut)
def add_point(
    data: schemas.RidePointCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    """Guarda un punto GPS del recorrido en tiempo real."""
    return services.add_point(db, data)


@router.get("/ride-points/{ride_id}", response_model=list[schemas.RidePointOut])
def get_points(
    ride_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    """Devuelve todos los puntos GPS registrados de un viaje."""
    return services.get_points(db, ride_id)


@router.post("/end-ride", response_model=schemas.EndRideResponse)
def end_ride(
    data: schemas.EndRideRequest,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    """Finaliza un viaje: calcula distancia, asigna estación más cercana y actualiza km de la bici."""
    return services.end_ride(db, data)


# ──────────────────────────────────────────────────
#  HISTORIAL Y CRUD (protegido)
# ──────────────────────────────────────────────────

@router.post("/rides", response_model=schemas.RideOut)
def create_ride(
    data: schemas.RideCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    """Crea un viaje manualmente (modo legacy/admin)."""
    return services.create_ride(db, data)


@router.get("/rides", response_model=list[schemas.RideOut])
def get_rides(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    """Devuelve el historial completo de todos los viajes."""
    return services.get_rides(db)


@router.get("/rides/{ride_id}", response_model=schemas.RideOut)
def get_ride(
    ride_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    """Devuelve el detalle de un viaje por ID."""
    return services.get_ride(db, ride_id)


@router.put("/rides/{ride_id}", response_model=schemas.RideOut)
def update_ride(
    ride_id: int,
    data: schemas.RideUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return services.update_ride(db, ride_id, data)


@router.delete("/rides/{ride_id}")
def delete_ride(
    ride_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return services.delete_ride(db, ride_id)
