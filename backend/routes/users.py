from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.dependencies import get_db
from core.security import get_current_user
from models.users import User
import schemas.users as schemas
import services.users as services

router = APIRouter(tags=["Users and Roles"])

@router.post("/roles", response_model=schemas.RoleOut)
def create_role(data: schemas.RoleCreate, db: Session = Depends(get_db)):
    return services.create_role(db, data)

@router.get("/roles", response_model=list[schemas.RoleOut])
def get_roles(db: Session = Depends(get_db)):
    return services.get_roles(db)

@router.post("/users", response_model=schemas.UserOut)
def create_user(data: schemas.UserCreate, db: Session = Depends(get_db)):
    return services.create_user(db, data)

@router.get("/users", response_model=list[schemas.UserOut])
def get_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return services.get_users(db)

@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, data: schemas.UserUpdate, db: Session = Depends(get_db)):
    return services.update_user(db, user_id, data)

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    return services.delete_user(db, user_id)
