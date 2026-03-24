from auth import hash_password
try:
    print("Hashing...")
    print(hash_password("123456"))
except Exception as e:
    print(repr(e))
