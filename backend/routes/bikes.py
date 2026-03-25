from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from core.dependencies import get_db
from core.security import get_current_user, get_current_admin
import schemas.bikes as schemas
import services.bikes as services

router = APIRouter(tags=["Bikes"])


@router.post("/bikes", response_model=schemas.BikeOut)
def create_bike(
    data: schemas.BikeCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    """Crea una bicicleta con UUID autogenerado y genera su código QR automáticamente."""
    return services.create_bike(db, data)


@router.get("/bikes", response_model=list[schemas.BikeOut])
def get_bikes(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return services.get_bikes(db)


@router.get("/bikes/{bike_id}", response_model=schemas.BikeOut)
def get_bike(
    bike_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return services.get_bike(db, bike_id)


@router.put("/bikes/{bike_id}", response_model=schemas.BikeOut)
def update_bike(
    bike_id: int,
    data: schemas.BikeUpdate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    return services.update_bike(db, bike_id, data)


@router.delete("/bikes/{bike_id}")
def delete_bike(
    bike_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    return services.delete_bike(db, bike_id)


@router.get("/bikes/{bike_id}/qr", response_class=FileResponse)
def download_qr(
    bike_id: int,
    _: object = Depends(get_current_admin),
):
    """Descarga el código QR de la bicicleta como imagen PNG."""
    filepath = services.get_bike_qr_path(bike_id)
    return FileResponse(
        path=filepath,
        media_type="image/png",
        filename=f"bike_{bike_id}_qr.png"
    )


@router.get("/bikes/{bike_id}/history", response_model=schemas.BikeHistoryOut)
def get_bike_history(
    bike_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    """Devuelve el historial completo de viajes de una bicicleta (Bike → Ride → User)."""
    return services.get_bike_history(db, bike_id)


@router.post("/maintenance", response_model=schemas.MaintenanceOut)
def create_maintenance(
    data: schemas.MaintenanceCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    return services.create_maintenance(db, data)


@router.get("/maintenance", response_model=list[schemas.MaintenanceOut])
def get_maintenance(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    return services.get_maintenance(db)
