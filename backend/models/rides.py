from sqlalchemy import Column, Integer, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Ride(Base):
    __tablename__ = "rides"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bike_id = Column(Integer, ForeignKey("bikes.id"), nullable=False)

    start_station_id = Column(Integer, ForeignKey("stations.id"))
    end_station_id = Column(Integer, ForeignKey("stations.id"))

    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)

    distance = Column(Float)

    user = relationship("User", back_populates="rides")
    bike = relationship("Bike", back_populates="rides")
    points = relationship("RidePoint", back_populates="ride", cascade="all, delete")

class RidePoint(Base):
    __tablename__ = "ride_points"

    id = Column(Integer, primary_key=True, index=True)
    ride_id = Column(Integer, ForeignKey("rides.id"), nullable=False)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    timestamp = Column(DateTime, default=datetime.utcnow)

    ride = relationship("Ride", back_populates="points")
