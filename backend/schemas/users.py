from pydantic import BaseModel
from typing import Optional, List


# ── Permisos por módulo ───────────────────────────────────────────────
class RolePermissionOut(BaseModel):
    id: int
    module: str
    can_view: bool
    can_edit: bool

    class Config:
        from_attributes = True


class RolePermissionSet(BaseModel):
    """Usado para asignar permisos a un rol (lista de permisos por módulo)."""
    module: str
    can_view: bool = False
    can_edit: bool = False


# ── Roles ─────────────────────────────────────────────────────────────
class RoleCreate(BaseModel):
    name: str

class RoleOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class RoleWithPermissions(BaseModel):
    id: int
    name: str
    permissions: List[RolePermissionOut] = []

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
    weight_kg: Optional[float] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    dni: Optional[str] = None
    password: Optional[str] = None
    role_id: Optional[int] = None
    weight_kg: Optional[float] = None

class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str]
    address: Optional[str]
    dni: Optional[str]
    role_id: Optional[int]
    weight_kg: Optional[float] = None

    class Config:
        from_attributes = True
