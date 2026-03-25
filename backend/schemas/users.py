from pydantic import BaseModel
from typing import Optional

class RoleCreate(BaseModel):
    name: str

class RoleOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    dni: Optional[str] = None
    password: str
    role_id: Optional[int] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    dni: Optional[str] = None
    password: Optional[str] = None
    role_id: Optional[int] = None

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    address: Optional[str]
    dni: Optional[str]
    role_id: Optional[int]

    class Config:
        from_attributes = True
