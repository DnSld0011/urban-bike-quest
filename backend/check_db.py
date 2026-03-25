import psycopg2
import sys

try:
    conn = psycopg2.connect("postgresql://postgres:root@localhost/bike_system")
    print("Conexión a BD exitosa")
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"Error conectando a BD: {e}")
    sys.exit(1)
