from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from core.dependencies import get_db
import schemas.auth as schemas
import services.auth as services

router = APIRouter(tags=["Auth"])

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return services.login_form(db, form_data)

@router.post("/login-json")
def login_json(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    return services.login_json(db, data)
