from sqlalchemy.orm import Session
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from core.security import verify_password, create_access_token
from models.users import User
from schemas.auth import LoginRequest

def login_form(db: Session, form_data: OAuth2PasswordRequestForm):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

def login_json(db: Session, data: LoginRequest):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")
    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "role_id": user.role_id,
        }
    }
