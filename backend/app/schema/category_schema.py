from typing import Optional

from pydantic import BaseModel


class CategoryCreate(BaseModel):
    Name: str
    Status: Optional[str] = "active"

    class Config:
        from_attributes = True


class CategoryUpdate(BaseModel):
    Name: Optional[str] = None
    Status: Optional[str] = None

    class Config:
        from_attributes = True


class CategoryResponse(BaseModel):
    PK_Category: int
    Name: str
    Status: Optional[str]

    class Config:
        from_attributes = True
