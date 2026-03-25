from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.dependencies import get_db
from schemas.others import AlertOut
import services.alerts as services

router = APIRouter(tags=["Alerts"])


@router.get("/alerts", response_model=list[AlertOut])
def get_alerts(db: Session = Depends(get_db)):
    """Devuelve todas las alertas de mantenimiento (activas e históricas)."""
    return services.get_all_alerts(db)


@router.get("/alerts/active", response_model=list[AlertOut])
def get_active_alerts(db: Session = Depends(get_db)):
    """Devuelve solo las alertas pendientes de resolución."""
    return services.get_active_alerts(db)


@router.patch("/alerts/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    """Marca una alerta de mantenimiento como resuelta."""
    return services.resolve_alert(db, alert_id)
