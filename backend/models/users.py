from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from database import Base


ALL_MODULES = ["bikes", "stations", "users", "trips", "maintenance", "alerts", "settings"]


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    users = relationship("User", back_populates="role")
    permissions = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan")


class RolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    module = Column(String, nullable=False)   # "bikes", "stations", "users", etc.
    can_view = Column(Boolean, default=False)
    can_edit = Column(Boolean, default=False)  # incluye crear y borrar

    role = relationship("Role", back_populates="permissions")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)
    address = Column(String)
    dni = Column(String, unique=True)
    password = Column(String, nullable=False)
    weight_kg = Column(Float, nullable=True)  # Para cálculo de calorías en viajes

    role_id = Column(Integer, ForeignKey("roles.id"))

    role = relationship("Role", back_populates="users")
    rides = relationship("Ride", back_populates="user", cascade="all, delete")
