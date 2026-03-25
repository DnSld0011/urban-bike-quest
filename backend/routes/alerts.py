from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.dependencies import get_db
from core.security import get_current_user, get_current_admin
from schemas.others import AlertOut
import services.alerts as services

router = APIRouter(tags=["Alerts"])


@router.get("/alerts", response_model=list[AlertOut])
def get_alerts(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    """Devuelve todas las alertas de mantenimiento paginadas."""
    return services.get_all_alerts(db, skip=skip, limit=limit)


@router.get("/alerts/active", response_model=list[AlertOut])
def get_active_alerts(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    """Devuelve solo las alertas pendientes de resolución."""
    return services.get_active_alerts(db, skip=skip, limit=limit)


@router.patch("/alerts/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),   # solo admin puede resolver
):
    """Marca una alerta de mantenimiento como resuelta. Solo admins."""
    return services.resolve_alert(db, alert_id)
