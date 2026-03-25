from sqlalchemy.orm import Session
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
)
from models.users import User
from schemas.auth import LoginRequest


def _build_login_response(user: User) -> dict:
    """Genera la respuesta estándar de login con access + refresh token."""
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role_id": user.role_id,
        },
    }


def login_form(db: Session, form_data: OAuth2PasswordRequestForm):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    # form login devuelve solo lo que OAuth2 requiere + refresh
    return {
        "access_token": create_access_token({"sub": str(user.id)}),
        "refresh_token": create_refresh_token({"sub": str(user.id)}),
        "token_type": "bearer",
    }


def login_json(db: Session, data: LoginRequest) -> dict:
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")
    return _build_login_response(user)


def refresh_access_token(db: Session, refresh_token: str) -> dict:
    """
    Valida un refresh_token y genera un nuevo access_token.
    No invalida el refresh_token anterior (stateless).
    """
    payload = decode_refresh_token(refresh_token)
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    new_access = create_access_token({"sub": str(user.id)})
    return {"access_token": new_access, "token_type": "bearer"}
