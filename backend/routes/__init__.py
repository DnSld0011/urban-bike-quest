from .auth import router as auth_router
from .users import router as users_router
from .stations import router as stations_router
from .bikes import router as bikes_router
from .rides import router as rides_router
from .others import router as others_router
from .seed import router as seed_router
from .alerts import router as alerts_router

__all__ = [
    "auth_router",
    "users_router",
    "stations_router",
    "bikes_router",
    "rides_router",
    "others_router",
    "seed_router",
    "alerts_router"
]
