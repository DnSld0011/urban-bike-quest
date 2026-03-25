import time
import requests
import json
import random

BASE_URL = "http://localhost:8000"

def simulate_ride():
    print("Iniciando simulación de viaje...")
    
    # 1. Asegurarnos de que existe el seed (Admin y Bici base)
    requests.get(f"{BASE_URL}/seed")
    print("[1] Seed inicializado")

    # 2. Login para obtener el token
    print("[2] Intentando login admin...")
    login_res = requests.post(f"{BASE_URL}/login-json", json={
        "email": "admin@test.com",
        "password": "123456"
    })
    if login_res.status_code != 200:
        print(f"Error login: {login_res.text}")
        return
    token = login_res.json()["access_token"]
    user_id = login_res.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login exitoso")

    # 3. Crear Estaciones de prueba (Parque Kenedy a Ovalo Miraflores)
    print("[3] Configurando estaciones (Inicio y Fin)")
    s1_res = requests.post(f"{BASE_URL}/stations", json={
        "name": "Parque Kennedy", "latitude": -12.1218, "longitude": -77.0298, "capacity": 10
    })
    s2_res = requests.post(f"{BASE_URL}/stations", json={
        "name": "Ovalo Miraflores", "latitude": -12.1197, "longitude": -77.0312, "capacity": 15
    })
    s1_id = s1_res.json()["id"]
    s2_id = s2_res.json()["id"]

    # 4. Crear Bici simulada
    print("[4] Registrando nueva bicicleta: SIM-999")
    b_res = requests.post(f"{BASE_URL}/bikes", json={"code": "SIM-999", "status": "available"})
    bike_id = b_res.json()["id"]

    # 5. Iniciar un Viaje
    print("[5] Iniciando Viaje (Usuario -> SIM-999 desde Parque Kennedy)")
    r_res = requests.post(f"{BASE_URL}/rides", json={
        "user_id": user_id,
        "bike_id": bike_id,
        "start_station_id": s1_id
    })
    ride_id = r_res.json()["id"]

    # Marcar bici como 'in_use' simulando el comportamiento real de un alquiler
    requests.put(f"{BASE_URL}/bikes", json={"code": "SIM-999", "status": "in_use"})

    # 6. Enviar puntos GPS a lo largo de 5 iteraciones
    print("[6] Arrancando GPS Tracker de la bicicleta")
    # Coordenadas simples interpoladas de s1 a s2
    lats = [-12.1218, -12.1213, -12.1208, -12.1203, -12.1197]
    lngs = [-77.0298, -77.0302, -77.0305, -77.0308, -77.0312]

    for i in range(5):
        # Enviar punto
        lat, lng = lats[i] + random.uniform(-0.0001, 0.0001), lngs[i] + random.uniform(-0.0001, 0.0001)
        requests.post(f"{BASE_URL}/ride-points", json={
            "ride_id": ride_id,
            "latitude": lat,
            "longitude": lng
        })
        print(f"   -> Punto GPS enviado: Lat {lat:.5f}, Lng {lng:.5f} (Guardado en BD)")
        time.sleep(2) # Espera de 2 segundos entre puntos para simulación

    # 7. Finalizar Viaje simulando llegada a S2
    # El endpoint backend para terminar no existe como tal en FastAPI (el user no lo creó explicitamente)
    # pero podemos actualizar la BD o dejar el viaje pendiente para que se vea como activo en el Mapa
    print("[7] Simulación completada. Viaje todavía marcado como ACTIVO para verlo en LiveMap.")
    print("Revisa el mapa en el navegador (http://localhost:8080/map) para ver los indicadores vivos.")

if __name__ == "__main__":
    simulate_ride()
