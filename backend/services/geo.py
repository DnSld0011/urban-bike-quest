"""
Utilidades geográficas.
Incluye la fórmula de Haversine para calcular distancias entre coordenadas.
"""
import math
from typing import Optional


EARTH_RADIUS_KM = 6371.0


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calcula la distancia en kilómetros entre dos puntos geográficos
    usando la fórmula de Haversine.

    Args:
        lat1, lon1: Coordenadas del punto de origen.
        lat2, lon2: Coordenadas del punto de destino.

    Returns:
        Distancia en kilómetros (float).
    """
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return EARTH_RADIUS_KM * c


def find_nearest_station(lat: float, lon: float, stations: list) -> Optional[object]:
    """
    Dado (lat, lon) y una lista de objetos Station, devuelve el más cercano.

    Cada objeto Station debe tener: id, latitude, longitude.
    Devuelve None si la lista está vacía.
    """
    if not stations:
        return None

    return min(
        stations,
        key=lambda s: haversine(lat, lon, s.latitude, s.longitude)
    )


def distance_to_station(lat: float, lon: float, station) -> float:
    """Devuelve la distancia en km entre (lat, lon) y una Station."""
    return haversine(lat, lon, station.latitude, station.longitude)
