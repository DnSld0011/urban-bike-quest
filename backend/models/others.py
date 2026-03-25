from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Weather(Base):
    __tablename__ = "weather"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False)
    temperature = Column(Float)
    condition = Column(String)


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String)
    date = Column(DateTime, nullable=False)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    predicted_bikes = Column(Integer)
    date = Column(DateTime, nullable=False)


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False, index=True)
    value = Column(String, nullable=False)
    description = Column(String)


# ────────────────────────────────────────────────
#  ALERTAS DE MANTENIMIENTO
# ────────────────────────────────────────────────
class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    bike_id = Column(Integer, ForeignKey("bikes.id"), nullable=False)
    message = Column(String, nullable=False)
    resolved = Column(Boolean, default=False)       # para marcarla como resuelta en el futuro
    created_at = Column(DateTime, default=datetime.utcnow)

    bike = relationship("Bike")
