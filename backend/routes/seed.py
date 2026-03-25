from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.dependencies import get_db
from core.security import hash_password
from models.users import Role, User
from models.bikes import Bike
from models.stations import Station

router = APIRouter(tags=["Seed"])

@router.get("/seed")
def seed(db: Session = Depends(get_db)):
    role = db.query(Role).filter(Role.name == "admin").first()
    if not role:
        role = Role(name="admin")
        db.add(role)
        db.commit()
        db.refresh(role)

    user = db.query(User).filter(User.email == "admin@test.com").first()
    if not user:
        user = User(
            full_name="Admin",
            email="admin@test.com",
            phone="999999999",
            address="Lima",
            dni="12345678",
            password=hash_password("123456"),
            role_id=role.id,
        )
        db.add(user)

    bike = db.query(Bike).filter(Bike.code == "BIKE-001").first()
    if not bike:
        bike = Bike(code="BIKE-001", status="available")
        db.add(bike)

    station = db.query(Station).filter(Station.name == "Centro").first()
    if not station:
        station = Station(name="Centro", latitude=-12.0464, longitude=-77.0428, capacity=20)
        db.add(station)

    db.commit()
    return {"message": "Seed OK — admin@test.com / 123456"}
