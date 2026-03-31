from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from core.dependencies import get_db
from core.security import get_current_user, get_current_admin
import schemas.users as schemas
import services.users as services

router = APIRouter(tags=["Users and Roles"])


# ── Roles CRUD (solo admin) ────────────────────────────────────────────────────
@router.get("/roles", response_model=List[schemas.RoleWithPermissions])
def get_roles(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    """Lista todos los roles con sus permisos. Solo admins."""
    return services.get_all_roles_with_permissions(db)


@router.post("/roles", response_model=schemas.RoleWithPermissions)
def create_role(
    data: schemas.RoleCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    """Crea un rol con permisos vacíos. Solo admins."""
    return services.create_role_with_default_permissions(db, data)


@router.get("/roles/{role_id}", response_model=schemas.RoleWithPermissions)
def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    """Obtiene un rol con sus permisos. Solo admins."""
    return services.get_role_with_permissions(db, role_id)


@router.put("/roles/{role_id}/permissions", response_model=schemas.RoleWithPermissions)
def set_role_permissions(
    role_id: int,
    permissions: List[schemas.RolePermissionSet],
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    """Reemplaza los permisos de un rol (por módulo). Solo admins."""
    return services.set_role_permissions(db, role_id, permissions)


@router.delete("/roles/{role_id}")
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    """Elimina un rol. Solo admins."""
    return services.delete_role(db, role_id)


# ── Users ──────────────────────────────────────────────────────────────────────
@router.post("/users", response_model=schemas.UserOut)
def create_user(data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Registro público (sin token)."""
    return services.create_user(db, data)


@router.get("/users", response_model=List[schemas.UserOut])
def get_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    """Lista de usuarios. Solo administradores."""
    return services.get_users(db, skip=skip, limit=limit)


@router.get("/users/me", response_model=schemas.UserOut)
def get_me(current_user=Depends(get_current_user)):
    """Devuelve el perfil del usuario autenticado."""
    return current_user


@router.get("/users/me/permissions", response_model=List[schemas.RolePermissionOut])
def get_my_permissions(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Devuelve los permisos del rol del usuario autenticado. Accesible por cualquier usuario."""
    from models.users import RolePermission
    perms = db.query(RolePermission).filter(
        RolePermission.role_id == current_user.role_id
    ).all()
    return perms


@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(
    user_id: int,
    data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Actualiza usuario. El usuario puede editarse a sí mismo; admin puede editar cualquiera."""
    if current_user.id != user_id and current_user.role_id != 1:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="No puedes editar este usuario")
    return services.update_user(db, user_id, data)


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    """Elimina usuario. Solo administradores."""
    return services.delete_user(db, user_id)
