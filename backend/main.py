import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import engine
from models import Base
from routes import (
    auth_router,
    users_router,
    stations_router,
    bikes_router,
    rides_router,
    others_router,
    seed_router,
    alerts_router
)

load_dotenv()

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Urban Bike Quest API", version="1.0.0")

# ================== CORS ==================
# Orígenes permitidos: desarrollo local + Lovable (*.lovable.app / *.gptengineer.app)
ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://localhost:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:5173",
]

# Soporte para orígenes adicionales vía variable de entorno
# Ejemplo en .env: ALLOWED_ORIGINS=https://mi-app.lovable.app,https://otro-dominio.com
extra_origins = os.getenv("ALLOWED_ORIGINS", "")
if extra_origins:
    ALLOWED_ORIGINS.extend([o.strip() for o in extra_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.(lovable\.app|gptengineer\.app)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================== ROUTERS ==================
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(stations_router)
app.include_router(bikes_router)
app.include_router(rides_router)
app.include_router(others_router)
app.include_router(seed_router)
app.include_router(alerts_router)