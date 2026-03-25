"""
Servicio de generación de códigos QR para bicicletas.
Los archivos PNG se guardan en: backend/static/qr/
"""
import os
import qrcode
from PIL import Image

# Directorio donde se almacenarán los QR generados
QR_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "qr")


def _ensure_qr_dir():
    os.makedirs(QR_DIR, exist_ok=True)


def generate_bike_qr(bike_id: int, base_url: str = "http://localhost:8000") -> str:
    """
    Genera un código QR para la bicicleta cuyo contenido apunta a:
        {base_url}/bike/{bike_id}

    Devuelve la ruta relativa al archivo PNG generado.
    """
    _ensure_qr_dir()

    url = f"{base_url}/bike/{bike_id}"

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img: Image.Image = qr.make_image(fill_color="black", back_color="white")

    filename = f"bike_{bike_id}.png"
    filepath = os.path.join(QR_DIR, filename)
    img.save(filepath)

    # Ruta relativa que se almacena en la BD
    return os.path.join("static", "qr", filename).replace("\\", "/")


def get_qr_filepath(bike_id: int) -> str | None:
    """Devuelve la ruta absoluta del QR si existe, de lo contrario None."""
    filepath = os.path.join(QR_DIR, f"bike_{bike_id}.png")
    return filepath if os.path.exists(filepath) else None
