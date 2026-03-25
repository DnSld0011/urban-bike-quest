from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Bike(Base):
    __tablename__ = "bikes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False, index=True)  # UUID autogenerado
    status = Column(String, default="available")

    # Ubicación actual
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Kilometraje
    total_km = Column(Float, default=0)
    max_km = Column(Float, default=500)           # km máximos antes de revisar
    last_maintenance_km = Column(Float, default=0)
    needs_maintenance = Column(Boolean, default=False)

    # QR
    qr_path = Column(String, nullable=True)       # ruta al archivo PNG del QR

    rides = relationship("Ride", back_populates="bike", cascade="all, delete")
    maintenances = relationship("Maintenance", back_populates="bike")


class Maintenance(Base):
    __tablename__ = "maintenance"

    id = Column(Integer, primary_key=True, index=True)
    bike_id = Column(Integer, ForeignKey("bikes.id"), nullable=False)

    date = Column(DateTime, default=datetime.utcnow)
    description = Column(String)
    km_at_service = Column(Float)

    bike = relationship("Bike", back_populates="maintenances")
