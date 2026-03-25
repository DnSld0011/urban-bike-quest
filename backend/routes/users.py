from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.dependencies import get_db
from core.security import get_current_user, get_current_admin
import schemas.users as schemas
import services.users as services

router = APIRouter(tags=["Users and Roles"])


# ── Roles (solo admin puede crear) ───────────────────────────────────────────
@router.post("/roles", response_model=schemas.RoleOut)
def create_role(
    data: schemas.RoleCreate,
    db: Session = Depends(get_db),
    _: object = Depends(get_current_admin),
):
    return services.create_role(db, data)


@router.get("/roles", response_model=list[schemas.RoleOut])
def get_roles(
    db: Session = Depends(get_db),
    _: object = Depends(get_current_user),
):
    return services.get_roles(db)


# ── Users ─────────────────────────────────────────────────────────────────────
@router.post("/users", response_model=schemas.UserOut)
def create_user(data: schemas.UserCreate, db: Session = Depends(get_db)):
    """Registro público (sin token)."""
    return services.create_user(db, data)


@router.get("/users", response_model=list[schemas.UserOut])
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
