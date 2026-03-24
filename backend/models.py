from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


# ---------------- ROLES ----------------
class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    users = relationship("User", back_populates="role")


# ---------------- USERS ----------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)
    address = Column(String)
    dni = Column(String, unique=True)
    password = Column(String, nullable=False)

    role_id = Column(Integer, ForeignKey("roles.id"))

    role = relationship("Role", back_populates="users")
    rides = relationship("Ride", back_populates="user", cascade="all, delete")


# ---------------- STATIONS ----------------
class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False)

    start_rides = relationship("Ride", foreign_keys="[Ride.start_station_id]")
    end_rides = relationship("Ride", foreign_keys="[Ride.end_station_id]")


# ---------------- BIKES ----------------
class Bike(Base):
    __tablename__ = "bikes"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)
    status = Column(String, default="available")
    total_km = Column(Float, default=0)

    last_maintenance_km = Column(Float, default=0)
    needs_maintenance = Column(Boolean, default=False)

    rides = relationship("Ride", back_populates="bike", cascade="all, delete")
    maintenances = relationship("Maintenance", back_populates="bike")


# ---------------- RIDES ----------------
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


# ---------------- GPS TRACKING ----------------
class RidePoint(Base):
    __tablename__ = "ride_points"

    id = Column(Integer, primary_key=True, index=True)
    ride_id = Column(Integer, ForeignKey("rides.id"), nullable=False)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    timestamp = Column(DateTime, default=datetime.utcnow)

    ride = relationship("Ride", back_populates="points")


# ---------------- MAINTENANCE ----------------
class Maintenance(Base):
    __tablename__ = "maintenance"

    id = Column(Integer, primary_key=True, index=True)
    bike_id = Column(Integer, ForeignKey("bikes.id"), nullable=False)

    date = Column(DateTime, default=datetime.utcnow)
    description = Column(String)
    km_at_service = Column(Float)

    bike = relationship("Bike", back_populates="maintenances")


# ---------------- WEATHER ----------------
class Weather(Base):
    __tablename__ = "weather"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False)

    temperature = Column(Float)
    condition = Column(String)


# ---------------- EVENTS ----------------
class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String)
    date = Column(DateTime, nullable=False)


# ---------------- PREDICTIONS ----------------
class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)

    predicted_bikes = Column(Integer)
    date = Column(DateTime, nullable=False)

# ---------------- SETTINGS ----------------
class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, nullable=False, index=True)
    value = Column(String, nullable=False)
    description = Column(String)

#-------------------------LOGIN------------------
