import os
import sys
from pathlib import Path

# Add the current directory (backend) to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from database import SessionLocal, engine
from models.bikes import Bike, Maintenance
from models.rides import Ride
from sqlalchemy import text
from services.bikes import create_bike
from schemas.bikes import BikeCreate

def reset_and_seed():
    db = SessionLocal()
    try:
        print("Ejecutando limpieza mediante TRUNCATE CASCADE para PostgreSQL...")
        try:
            db.execute(text("TRUNCATE TABLE bikes RESTART IDENTITY CASCADE"))
            db.commit()
            print("Tablas truncadas y secuencias reiniciadas.")
        except Exception as esqlite:
            # Si es SQLite y falló, intentamos borrado estándar ignorando dependencias temporales
            db.rollback()
            print("Fallback a borrado estándar iterativo...")
            for table in ['rides', 'maintenance', 'bikes']:
                db.execute(text(f"DELETE FROM {table}"))
            db.execute(text("DELETE FROM sqlite_sequence WHERE name IN ('rides', 'maintenance', 'bikes')"))
            db.commit()

        print("Creando 5 bicicletas de prueba usando la logica de servicios (BIKE-0000x)...")
        for i in range(1, 6):
            data = BikeCreate(
                status="available",
                station_id=(i % 3) + 1,  # Asignar a estaciones 1, 2, 3
                latitude=0.0,
                longitude=0.0,
                max_km=500
            )
            created = create_bike(db, data)
            print(f"Bicicleta creada con código: {created.code}")
            
        print("Proceso completado exitosamente.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_and_seed()
