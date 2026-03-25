from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.dependencies import get_db
import schemas.others as schemas
import services.others as services

router = APIRouter(tags=["Others"])

@router.post("/weather", response_model=schemas.WeatherOut)
def create_weather(data: schemas.WeatherCreate, db: Session = Depends(get_db)):
    return services.create_weather(db, data)

@router.get("/weather", response_model=list[schemas.WeatherOut])
def get_weather(db: Session = Depends(get_db)):
    return services.get_weather(db)

@router.post("/events", response_model=schemas.EventOut)
def create_event(data: schemas.EventCreate, db: Session = Depends(get_db)):
    return services.create_event(db, data)

@router.get("/events", response_model=list[schemas.EventOut])
def get_events(db: Session = Depends(get_db)):
    return services.get_events(db)

@router.post("/predictions", response_model=schemas.PredictionOut)
def create_prediction(data: schemas.PredictionCreate, db: Session = Depends(get_db)):
    return services.create_prediction(db, data)

@router.get("/predictions", response_model=list[schemas.PredictionOut])
def get_predictions(db: Session = Depends(get_db)):
    return services.get_predictions(db)

@router.post("/settings", response_model=schemas.SettingOut)
def create_setting(data: schemas.SettingCreate, db: Session = Depends(get_db)):
    return services.create_setting(db, data)

@router.get("/settings", response_model=list[schemas.SettingOut])
def get_settings(db: Session = Depends(get_db)):
    return services.get_settings(db)

@router.put("/settings/{key}", response_model=schemas.SettingOut)
def update_setting(key: str, data: schemas.SettingUpdate, db: Session = Depends(get_db)):
    return services.update_setting(db, key, data)
