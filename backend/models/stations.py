from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from database import Base

class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False)

    start_rides = relationship("Ride", foreign_keys="[Ride.start_station_id]")
    end_rides = relationship("Ride", foreign_keys="[Ride.end_station_id]")
