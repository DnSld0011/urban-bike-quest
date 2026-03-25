"""
Servicio de alertas de mantenimiento de bicicletas.
Se invoca internamente desde services/rides.py al detectar needs_maintenance=True.
"""
from datetime import datetime
from sqlalchemy.orm import Session
from models.others import Alert
from models.bikes import Bike


def create_maintenance_alert(db: Session, bike: Bike) -> Alert:
    """
    Crea una alerta de mantenimiento para la bicicleta indicada.
    Revisamos si ya existe una alerta activa (no resuelta) para evitar duplicados.
    """
    existing = (
        db.query(Alert)
        .filter(Alert.bike_id == bike.id, Alert.resolved == False)
        .first()
    )
    if existing:
        return existing  # No duplicar alertas activas

    msg = (
        f"⚠️ Bicicleta '{bike.code}' requiere mantenimiento. "
        f"Km acumulados: {round(bike.total_km or 0, 2)} / {bike.max_km} km permitidos."
    )
    alert = Alert(bike_id=bike.id, message=msg, created_at=datetime.utcnow())
    db.add(alert)
    db.flush()  # obtener ID sin hacer commit (el caller hará commit)
    return alert


def get_all_alerts(db: Session, skip: int = 0, limit: int = 50):
    return db.query(Alert).order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()


def get_active_alerts(db: Session, skip: int = 0, limit: int = 50):
    return db.query(Alert).filter(Alert.resolved == False).order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()


def resolve_alert(db: Session, alert_id: int) -> Alert:
    from fastapi import HTTPException
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    alert.resolved = True
    db.commit()
    db.refresh(alert)
    return alert
