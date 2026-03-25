from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.users import User, Role
from schemas.users import UserCreate, UserUpdate, RoleCreate
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
