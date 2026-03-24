from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from auth import hash_password, verify_password, create_access_token
from jose import JWTError, jwt
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from schemas import LoginRequest
from auth import verify_password, create_access_token
from models import User
from database import SessionLocal
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException

# Crear tablas
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# ---------------- DB ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- login ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# ---------------- AUTH ----------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, "supersecretkey", algorithms=["HS256"])
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")

        user = db.query(models.User).filter(models.User.id == int(user_id)).first()

        if user is None:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# ---------------- LOGIN ----------------
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")

    token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": token,
        "token_type": "bearer"
    }



# -------------loginn------------------------
@app.post("/login-json")
def login_json(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Password incorrecto")

    token = create_access_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email
        }
    }

# ================= ROLES =================
@app.post("/roles")
def create_role(name: str, db: Session = Depends(get_db)):
    role = models.Role(name=name)
    db.add(role)
    db.commit()
    db.refresh(role)
    return role

@app.get("/roles")
def get_roles(db: Session = Depends(get_db)):
    return db.query(models.Role).all()

# ================= USERS =================
@app.post("/users")
def create_user(user: dict, db: Session = Depends(get_db)):

    user["password"] = hash_password(user["password"])

    new_user = models.User(**user)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Usuario creado"}

@app.get("/users")
def get_users(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.User).all()

# ================= STATIONS =================
@app.post("/stations")
def create_station(station: dict, db: Session = Depends(get_db)):
    new_station = models.Station(**station)
    db.add(new_station)
    db.commit()
    db.refresh(new_station)
    return new_station

@app.get("/stations")
def get_stations(db: Session = Depends(get_db)):
    return db.query(models.Station).all()

# ================= BIKES =================
@app.post("/bikes")
def create_bike(bike: dict, db: Session = Depends(get_db)):
    new_bike = models.Bike(**bike)
    db.add(new_bike)
    db.commit()
    db.refresh(new_bike)
    return new_bike

@app.get("/bikes")
def get_bikes(db: Session = Depends(get_db)):
    return db.query(models.Bike).all()

# ================= RIDES =================
@app.post("/rides")
def create_ride(ride: dict, db: Session = Depends(get_db)):
    new_ride = models.Ride(**ride)
    db.add(new_ride)
    db.commit()
    db.refresh(new_ride)
    return new_ride

@app.get("/rides")
def get_rides(db: Session = Depends(get_db)):
    return db.query(models.Ride).all()

# ================= GPS TRACK =================
@app.post("/ride-points")
def add_point(point: dict, db: Session = Depends(get_db)):
    new_point = models.RidePoint(**point)
    db.add(new_point)
    db.commit()
    return {"message": "Punto agregado"}

@app.get("/ride-points/{ride_id}")
def get_points(ride_id: int, db: Session = Depends(get_db)):
    return db.query(models.RidePoint).filter_by(ride_id=ride_id).all()

# ================= MAINTENANCE =================
@app.post("/maintenance")
def create_maintenance(data: dict, db: Session = Depends(get_db)):
    m = models.Maintenance(**data)
    db.add(m)
    db.commit()
    return m

@app.get("/maintenance")
def get_maintenance(db: Session = Depends(get_db)):
    return db.query(models.Maintenance).all()

# ================= WEATHER =================
@app.post("/weather")
def create_weather(data: dict, db: Session = Depends(get_db)):
    w = models.Weather(**data)
    db.add(w)
    db.commit()
    return w

@app.get("/weather")
def get_weather(db: Session = Depends(get_db)):
    return db.query(models.Weather).all()

# ================= EVENTS =================
@app.post("/events")
def create_event(data: dict, db: Session = Depends(get_db)):
    e = models.Event(**data)
    db.add(e)
    db.commit()
    return e

@app.get("/events")
def get_events(db: Session = Depends(get_db)):
    return db.query(models.Event).all()

# ================= PREDICTIONS =================
@app.post("/predictions")
def create_prediction(data: dict, db: Session = Depends(get_db)):
    p = models.Prediction(**data)
    db.add(p)
    db.commit()
    return p

@app.get("/predictions")
def get_predictions(db: Session = Depends(get_db)):
    return db.query(models.Prediction).all()

# ================= SEED =================
@app.get("/seed")
def seed(db: Session = Depends(get_db)):
    role = models.Role(name="admin")
    db.add(role)
    db.commit()

    user = models.User(
        full_name="Admin",
        email="admin@test.com",
        phone="999999999",
        address="Lima",
        dni="12345678",
        password=hash_password("123456"),
        role_id=1
    )

    bike = models.Bike(code="BIKE-001", status="available")
    station = models.Station(name="Centro", latitude=-12.0464, longitude=-77.0428, capacity=20)

    db.add_all([user, bike, station])
    db.commit()

    return {"message": "Seed OK"}