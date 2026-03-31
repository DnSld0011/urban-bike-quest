from database import SessionLocal
from models.users import User

db = SessionLocal()
try:
    user = db.query(User).first()
    print("Éxito:", user.full_name)
except Exception as e:
    print("================ ERROR ================")
    print(e)
