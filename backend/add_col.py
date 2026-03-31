from database import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS weight_kg FLOAT;"))
        conn.commit()
    print("Columna weight_kg añadida existosamente a PostgreSQL")
except Exception as e:
    print("Error:", e)
