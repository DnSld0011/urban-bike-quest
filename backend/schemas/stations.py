from pydantic import BaseModel

class StationCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    capacity: int

class StationOut(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    capacity: int

    class Config:
        from_attributes = True
