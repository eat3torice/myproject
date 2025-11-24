from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class VariationCreate(BaseModel):
    ProductID: int
    SKU: str
    Name: Optional[str] = None
    Price: Optional[Decimal] = None
    Quantity: Optional[int] = 0
    Color: Optional[str] = None
    Material: Optional[str] = None
    Size: Optional[str] = None
    Description: Optional[str] = None
    Status: Optional[str] = "active"

    class Config:
        from_attributes = True


class VariationUpdate(BaseModel):
    SKU: Optional[str] = None
    Name: Optional[str] = None
    Price: Optional[Decimal] = None
    Quantity: Optional[int] = None
    Color: Optional[str] = None
    Material: Optional[str] = None
    Size: Optional[str] = None
    Description: Optional[str] = None
    Status: Optional[str] = None

    class Config:
        from_attributes = True


class VariationResponse(BaseModel):
    PK_Variation: int
    ProductID: int
    SKU: str
    Name: Optional[str]
    Price: Optional[Decimal]
    Quantity: Optional[int]
    Color: Optional[str]
    Material: Optional[str]
    Size: Optional[str]
    Description: Optional[str]
    Sold: Optional[int]
    Status: Optional[str]

    class Config:
        from_attributes = True
