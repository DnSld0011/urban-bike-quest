from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.others import Weather, Event, Prediction, SystemSetting
import schemas.others as schemas

def create_weather(db: Session, data: schemas.WeatherCreate):
    w = Weather(**data.model_dump())
    db.add(w)
    db.commit()
    db.refresh(w)
    return w

def get_weather(db: Session):
    return db.query(Weather).all()

def create_event(db: Session, data: schemas.EventCreate):
    e = Event(**data.model_dump())
    db.add(e)
    db.commit()
    db.refresh(e)
    return e

def get_events(db: Session):
    return db.query(Event).all()

def create_prediction(db: Session, data: schemas.PredictionCreate):
    p = Prediction(**data.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

def get_predictions(db: Session):
    return db.query(Prediction).all()

def create_setting(db: Session, data: schemas.SettingCreate):
    existing = db.query(SystemSetting).filter(SystemSetting.key == data.key).first()
    if existing:
        raise HTTPException(status_code=400, detail="Setting key already exists")
    s = SystemSetting(**data.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s

def get_settings(db: Session):
    return db.query(SystemSetting).all()

def update_setting(db: Session, key: str, data: schemas.SettingUpdate):
    s = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if not s:
        s = SystemSetting(key=key, value=data.value, description="")
        db.add(s)
    else:
        s.value = data.value
    db.commit()
    db.refresh(s)
    return s
