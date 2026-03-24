import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from dotenv import load_dotenv

from auth import hash_password, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from database import SessionLocal, engine
import models
import schemas

load_dotenv()

# Crear tablas
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Urban Bike Quest API", version="1.0.0")

# ================== CORS ==================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== DB ==================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ================== AUTH ==================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        user = db.query(models.User).filter(models.User.id == int(user_id)).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# ================== LOGIN (form-data para Swagger) ==================
@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}

# ================== LOGIN (JSON para el frontend) ==================
@app.post("/login-json")
def login_json(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
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

# ================== ROLES ==================
@app.post("/roles", response_model=schemas.RoleOut)
def create_role(data: schemas.RoleCreate, db: Session = Depends(get_db)):
    role = models.Role(name=data.name)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

@app.get("/roles", response_model=list[schemas.RoleOut])
def get_roles(db: Session = Depends(get_db)):
    return db.query(models.Role).all()

# ================== USERS ==================
@app.post("/users", response_model=schemas.UserOut)
def create_user(data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    user_data = data.model_dump()
    user_data["password"] = hash_password(user_data["password"])
    new_user = models.User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/users", response_model=list[schemas.UserOut])
def get_users(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.User).all()

# ================== STATIONS ==================
@app.post("/stations", response_model=schemas.StationOut)
def create_station(data: schemas.StationCreate, db: Session = Depends(get_db)):
    new_station = models.Station(**data.model_dump())
    db.add(new_station)
    db.commit()
    db.refresh(new_station)
    return new_station

@app.get("/stations", response_model=list[schemas.StationOut])
def get_stations(db: Session = Depends(get_db)):
    return db.query(models.Station).all()

@app.put("/stations/{station_id}", response_model=schemas.StationOut)
def update_station(station_id: int, data: schemas.StationCreate, db: Session = Depends(get_db)):
    station = db.query(models.Station).filter(models.Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Estación no encontrada")
    for key, value in data.model_dump().items():
        setattr(station, key, value)
    db.commit()
    db.refresh(station)
    return station

@app.delete("/stations/{station_id}")
def delete_station(station_id: int, db: Session = Depends(get_db)):
    station = db.query(models.Station).filter(models.Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Estación no encontrada")
    db.delete(station)
    db.commit()
    return {"message": "Estación eliminada"}

# ================== BIKES ==================
@app.post("/bikes", response_model=schemas.BikeOut)
def create_bike(data: schemas.BikeCreate, db: Session = Depends(get_db)):
    new_bike = models.Bike(**data.model_dump())
    db.add(new_bike)
    db.commit()
    db.refresh(new_bike)
    return new_bike

@app.get("/bikes", response_model=list[schemas.BikeOut])
def get_bikes(db: Session = Depends(get_db)):
    return db.query(models.Bike).all()

# ================== RIDES ==================
@app.post("/rides", response_model=schemas.RideOut)
def create_ride(data: schemas.RideCreate, db: Session = Depends(get_db)):
    new_ride = models.Ride(**data.model_dump())
    db.add(new_ride)
    db.commit()
    db.refresh(new_ride)
    return new_ride

@app.get("/rides", response_model=list[schemas.RideOut])
def get_rides(db: Session = Depends(get_db)):
    return db.query(models.Ride).all()

@app.get("/rides/{ride_id}", response_model=schemas.RideOut)
def get_ride(ride_id: int, db: Session = Depends(get_db)):
    ride = db.query(models.Ride).filter(models.Ride.id == ride_id).first()
    if not ride:
        raise HTTPException(status_code=404, detail="Recorrido no encontrado")
    return ride

# ================== GPS TRACK ==================
@app.post("/ride-points", response_model=schemas.RidePointOut)
def add_point(data: schemas.RidePointCreate, db: Session = Depends(get_db)):
    new_point = models.RidePoint(**data.model_dump())
    db.add(new_point)
    db.commit()
    db.refresh(new_point)
    return new_point

@app.get("/ride-points/{ride_id}", response_model=list[schemas.RidePointOut])
def get_points(ride_id: int, db: Session = Depends(get_db)):
    return db.query(models.RidePoint).filter(models.RidePoint.ride_id == ride_id).all()

# ================== MAINTENANCE ==================
@app.post("/maintenance", response_model=schemas.MaintenanceOut)
def create_maintenance(data: schemas.MaintenanceCreate, db: Session = Depends(get_db)):
    m = models.Maintenance(**data.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m

@app.get("/maintenance", response_model=list[schemas.MaintenanceOut])
def get_maintenance(db: Session = Depends(get_db)):
    return db.query(models.Maintenance).all()

# ================== WEATHER ==================
@app.post("/weather", response_model=schemas.WeatherOut)
def create_weather(data: schemas.WeatherCreate, db: Session = Depends(get_db)):
    w = models.Weather(**data.model_dump())
    db.add(w)
    db.commit()
    db.refresh(w)
    return w

@app.get("/weather", response_model=list[schemas.WeatherOut])
def get_weather(db: Session = Depends(get_db)):
    return db.query(models.Weather).all()

# ================== EVENTS ==================
@app.post("/events", response_model=schemas.EventOut)
def create_event(data: schemas.EventCreate, db: Session = Depends(get_db)):
    e = models.Event(**data.model_dump())
    db.add(e)
    db.commit()
    db.refresh(e)
    return e

@app.get("/events", response_model=list[schemas.EventOut])
def get_events(db: Session = Depends(get_db)):
    return db.query(models.Event).all()

# ================== PREDICTIONS ==================
@app.post("/predictions", response_model=schemas.PredictionOut)
def create_prediction(data: schemas.PredictionCreate, db: Session = Depends(get_db)):
    p = models.Prediction(**data.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@app.get("/predictions", response_model=list[schemas.PredictionOut])
def get_predictions(db: Session = Depends(get_db)):
    return db.query(models.Prediction).all()

# ================== SEED ==================
@app.get("/seed")
def seed(db: Session = Depends(get_db)):
    # Crear rol admin si no existe
    role = db.query(models.Role).filter(models.Role.name == "admin").first()
    if not role:
        role = models.Role(name="admin")
        db.add(role)
        db.commit()
        db.refresh(role)

    # Crear usuario admin si no existe
    user = db.query(models.User).filter(models.User.email == "admin@test.com").first()
    if not user:
        user = models.User(
            full_name="Admin",
            email="admin@test.com",
            phone="999999999",
            address="Lima",
            dni="12345678",
            password=hash_password("123456"),
            role_id=role.id,
        )
        db.add(user)

    # Crear bici si no existe
    bike = db.query(models.Bike).filter(models.Bike.code == "BIKE-001").first()
    if not bike:
        bike = models.Bike(code="BIKE-001", status="available")
        db.add(bike)

    # Crear estación si no existe
    station = db.query(models.Station).filter(models.Station.name == "Centro").first()
    if not station:
        station = models.Station(name="Centro", latitude=-12.0464, longitude=-77.0428, capacity=20)
        db.add(station)

    db.commit()
    return {"message": "Seed OK — admin@test.com / 123456"}