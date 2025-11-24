from typing import Optional

from pydantic import BaseModel


class BrandCreate(BaseModel):
    Name: str
    Note: Optional[str] = None
    Status: Optional[str] = "active"

    class Config:
        from_attributes = True


class BrandUpdate(BaseModel):
    Name: Optional[str] = None
    Note: Optional[str] = None
    Status: Optional[str] = None

    class Config:
        from_attributes = True


class BrandResponse(BaseModel):
    PK_Brand: int
    Name: str
    Note: Optional[str]
    Status: Optional[str]

    class Config:
        from_attributes = True
