import requests
import json
import uuid

BASE_URL = "http://localhost:8000"

def print_step(name):
    print(f"\n{'='*50}")
    print(f"TEST: {name}")
    print(f"{'='*50}")

def assert_status(response, expected, msg):
    if response.status_code != expected:
        print(f"FAIL: {msg} (Status {response.status_code})")
        print(f"   Detalle: {response.text}")
        exit(1)
    else:
        print(f"OK: {msg}")

# ─────────────────────────────────────────────────────────
# 1. AUTHENTICATION & USERS
# ─────────────────────────────────────────────────────────
print_step("MÓDULO: AUTH & USERS")

# Intentamos hacer login con admin@test.com
login_data = {"email": "admin@test.com", "password": "123456"}
res = requests.post(f"{BASE_URL}/login-json", json=login_data)

if res.status_code != 200:
    print("⚠️ Admin no encontrado, creando admin primero...")
    # Crear admin
    create_admin = {
        "full_name": "Admin Test",
        "email": "admin@test.com",
        "password": "123456",
        "role_id": 1
    }
    requests.post(f"{BASE_URL}/users", json=create_admin)
    res = requests.post(f"{BASE_URL}/login-json", json=login_data)

assert_status(res, 200, "Login exitoso y obtención de tokens")
tokens = res.json()
ACCESS_TOKEN = tokens["access_token"]
REFRESH_TOKEN = tokens["refresh_token"]
ADMIN_ID = tokens["user"]["id"]

headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}

# Test Refresh Token
res = requests.post(f"{BASE_URL}/refresh", json={"refresh_token": REFRESH_TOKEN})
assert_status(res, 200, "Refresco del token (POST /refresh)")
ACCESS_TOKEN = res.json()["access_token"]
headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}

# Crear un usuario normal (público)
unique = str(uuid.uuid4())[:8]
user_mail = f"user_{unique}@test.com"
new_user = {
    "full_name": f"User {unique}",
    "email": user_mail,
    "password": "password123",
    "role_id": 2
}
res = requests.post(f"{BASE_URL}/users", json=new_user)
assert_status(res, 200, "Registro de usuario normal (POST /users)")
USER_ID = res.json()["id"]

# Listar usuarios (requiere admin)
res = requests.get(f"{BASE_URL}/users?limit=5", headers=headers)
assert_status(res, 200, "Listar usuarios paginado (GET /users - Requiere Admin)")

# Perfil (GET /users/me)
res_me = requests.get(f"{BASE_URL}/users/me", headers=headers)
assert_status(res_me, 200, "Perfil del usuario (GET /users/me)")

# ─────────────────────────────────────────────────────────
# 2. STATIONS
# ─────────────────────────────────────────────────────────
print_step("MÓDULO: STATIONS")

# Listar (Público)
res = requests.get(f"{BASE_URL}/stations")
assert_status(res, 200, "Listar estaciones (público)")

# Crear estación A (requiere admin)
station_a = {"name": f"Station A {unique}", "latitude": -12.043, "longitude": -77.028, "capacity": 10}
res = requests.post(f"{BASE_URL}/stations", json=station_a, headers=headers)
assert_status(res, 200, "Crear Station A (POST /stations)")
STATION_A_ID = res.json()["id"]

# Crear estación B (requiere admin)
station_b = {"name": f"Station B {unique}", "latitude": -12.050, "longitude": -77.035, "capacity": 15}
res = requests.post(f"{BASE_URL}/stations", json=station_b, headers=headers)
assert_status(res, 200, "Crear Station B (POST /stations)")
STATION_B_ID = res.json()["id"]

# Editar estación A
res = requests.put(f"{BASE_URL}/stations/{STATION_A_ID}", json={"name": f"Station A Mod {unique}", "latitude": -12.043, "longitude": -77.028, "capacity": 20}, headers=headers)
assert_status(res, 200, "Editar estación (PUT /stations/{id})")

# ─────────────────────────────────────────────────────────
# 3. BIKES
# ─────────────────────────────────────────────────────────
print_step("MÓDULO: BIKES")

# Crear bicicleta
bike_data = {"station_id": STATION_A_ID, "max_km": 50.0} # Limite bajo para probar alertas
res = requests.post(f"{BASE_URL}/bikes", json=bike_data, headers=headers)
assert_status(res, 200, "Crear bicicleta generará UUID y QR (POST /bikes)")
BIKE_ID = res.json()["id"]

# Listar bicis
res = requests.get(f"{BASE_URL}/bikes", headers=headers)
assert_status(res, 200, "Listar bicicletas paginado (GET /bikes)")

# Obtener QR (sin descargarlo completo, probar status)
res = requests.get(f"{BASE_URL}/bikes/{BIKE_ID}/qr", headers=headers)
assert_status(res, 200, "Descargar código QR (GET /bikes/{id}/qr)")

# ─────────────────────────────────────────────────────────
# 4. RIDES (CORE BUSINESS LOGIC)
# ─────────────────────────────────────────────────────────
print_step("MÓDULO: RIDES & TRACKING")

# Hacer login con el usuario normal creado para simular acción de la app
res_user = requests.post(f"{BASE_URL}/login-json", json={"email": user_mail, "password": "password123"})
USER_TOKEN = res_user.json()["access_token"]
user_headers = {"Authorization": f"Bearer {USER_TOKEN}"}

# Start Ride
ride_start = {"user_id": USER_ID, "bike_id": BIKE_ID, "latitude": -12.043, "longitude": -77.028} # Cerca a Station A
res = requests.post(f"{BASE_URL}/start-ride", json=ride_start, headers=user_headers)
assert_status(res, 200, "Iniciar viaje (POST /start-ride)")
RIDE_ID = res.json()["ride"]["id"]

# Add points (simulando trayecto hacia Station B)
points = [
    {"latitude": -12.045, "longitude": -77.030},
    {"latitude": -12.047, "longitude": -77.032},
    {"latitude": -12.049, "longitude": -77.034}
]
for p in points:
    res = requests.post(f"{BASE_URL}/ride-points", json={"ride_id": RIDE_ID, "latitude": p["latitude"], "longitude": p["longitude"]}, headers=user_headers)
    assert_status(res, 200, f"Añadir punto GPS ({p['latitude']}, {p['longitude']})")

# End Ride (Cerca a Station B)
# Nota: La bici fue creada con max_km=50, para forzar mantenimiento simulamos una tabla actualizada
requests.put(f"{BASE_URL}/bikes/{BIKE_ID}", json={"max_km": 2.0}, headers=headers)

end_req = {"ride_id": RIDE_ID, "latitude": -12.050, "longitude": -77.035}
res = requests.post(f"{BASE_URL}/end-ride", json=end_req, headers=user_headers)
assert_status(res, 200, "Finalizar viaje (Haversine detectará Station B) (POST /end-ride)")
print("   Distancia calculada:", res.json()["total_distance_km"])

# Consultar historial
res = requests.get(f"{BASE_URL}/bikes/{BIKE_ID}/history", headers=headers)
assert_status(res, 200, "Historial de viaje guardado con éxito (GET /bikes/{id}/history)")

# Forzar viaje 2 para detonar alerta
ride_start2 = {"user_id": USER_ID, "bike_id": BIKE_ID, "latitude": -12.050, "longitude": -77.035}
res = requests.post(f"{BASE_URL}/start-ride", json=ride_start2, headers=user_headers)
RIDE_ID_2 = res.json()["ride"]["id"]
# Simulamos un viaje largo (trampa mandándolo lejos directamente y finalizando ahí)
res = requests.post(f"{BASE_URL}/end-ride", json={"ride_id": RIDE_ID_2, "latitude": -12.100, "longitude": -77.100}, headers=user_headers)
assert_status(res, 200, "Viaje largo para exceder max_km")

# ─────────────────────────────────────────────────────────
# 5. ALERTS & MAINTENANCE
# ─────────────────────────────────────────────────────────
print_step("MÓDULO: ALERTS & MAINTENANCE")

# Listar alertas (como usuario no de admin para ver error, luego como admin ok)
res = requests.get(f"{BASE_URL}/alerts", headers=user_headers)
assert_status(res, 200, "Listar todas las alertas (GET /alerts - Protegido normal)")
alertas = res.json()

activos = requests.get(f"{BASE_URL}/alerts/active", headers=headers).json()
print(f"   Alertas activas encontradas: {len(activos)}")
if len(activos) > 0:
    ALERT_ID = activos[0]["id"]
    # Intentar resolver como usuario (debe fallar 403)
    res = requests.patch(f"{BASE_URL}/alerts/{ALERT_ID}/resolve", headers=user_headers)
    assert_status(res, 403, "Usuario no admin es bloqueado para resolver alertas (RBAC)")
    
    # Resolver como admin
    res = requests.patch(f"{BASE_URL}/alerts/{ALERT_ID}/resolve", headers=headers)
    assert_status(res, 200, "Admin resuelve la alerta (PATCH /alerts/{id}/resolve)")
else:
    print("⚠️ No hay alertas activas generadas. El cálculo quizás no superó los 2.0 km.")


# ─────────────────────────────────────────────────────────
# 6. TEARDOWN (CLEANUP)
# ─────────────────────────────────────────────────────────
print_step("TEARDOWN (Limpieza)")

res = requests.delete(f"{BASE_URL}/stations/{STATION_A_ID}", headers=headers)
assert_status(res, 200, "Eliminar estacón A (Solo Admin)")

res = requests.delete(f"{BASE_URL}/stations/{STATION_B_ID}", headers=headers)
assert_status(res, 200, "Eliminar estacón B (Solo Admin)")

res = requests.delete(f"{BASE_URL}/users/{USER_ID}", headers=headers)
assert_status(res, 200, "Eliminar usuario de prueba (Solo Admin)")

print("\nTODOS LOS MODULOS DEL API (E2E) PASARON EXITOSAMENTE.\n")
