from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.users import User, Role, RolePermission, ALL_MODULES
from schemas.users import UserCreate, UserUpdate, RoleCreate, RolePermissionSet
from core.security import hash_password

def create_role(db: Session, data: RoleCreate):
    role = Role(name=data.name)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

def get_roles(db: Session):
    return db.query(Role).all()

def create_user(db: Session, data: UserCreate):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    user_data = data.model_dump()
    user_data["password"] = hash_password(user_data["password"])
    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_users(db: Session, skip: int = 0, limit: int = 50):
    return db.query(User).offset(skip).limit(limit).all()

def update_user(db: Session, user_id: int, data: UserUpdate):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    update_data = data.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        update_data["password"] = hash_password(update_data["password"])
    for key, value in update_data.items():
        setattr(u, key, value)
    db.commit()
    db.refresh(u)
    return u

def delete_user(db: Session, user_id: int):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(u)
    db.commit()
    return {"message": "Usuario eliminado"}


# ── Permisos de Roles ──────────────────────────────────────────────────
def get_role_with_permissions(db: Session, role_id: int):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    return role


def get_all_roles_with_permissions(db: Session):
    return db.query(Role).all()


def create_role_with_default_permissions(db: Session, data: RoleCreate):
    existing = db.query(Role).filter(Role.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un rol con ese nombre")
    role = Role(name=data.name)
    db.add(role)
    db.commit()
    db.refresh(role)
    # Crear entradas de permiso (todas en False por defecto)
    for module in ALL_MODULES:
        perm = RolePermission(role_id=role.id, module=module, can_view=False, can_edit=False)
        db.add(perm)
    db.commit()
    db.refresh(role)
    return role


def set_role_permissions(db: Session, role_id: int, permissions: list[RolePermissionSet]):
    """Reemplaza todos los permisos de un rol con los que se pasan en la lista."""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    # Eliminar permisos actuales y recrear
    db.query(RolePermission).filter(RolePermission.role_id == role_id).delete()
    for pset in permissions:
        perm = RolePermission(
            role_id=role_id,
            module=pset.module,
            can_view=pset.can_view,
            can_edit=pset.can_edit
        )
        db.add(perm)
    db.commit()
    db.refresh(role)
    return role


def delete_role(db: Session, role_id: int):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    db.delete(role)
    db.commit()
    return {"message": "Rol eliminado"}
