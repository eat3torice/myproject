from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel


class ProductVariationPublic(BaseModel):
    PK_Variation: int
    SKU: str
    Name: Optional[str]
    Price: Decimal
    Quantity: int
    Color: Optional[str]
    Material: Optional[str]
    Size: Optional[str]
    Description: Optional[str]
    Status: str
    ProductID: int
    CategoryID: Optional[int] = None

    class Config:
        from_attributes = True


class ProductPublic(BaseModel):
    PK_Product: int
    Name: str
    Images: Optional[str]
    CategoryID: int
    BrandID: int
    variations: List[ProductVariationPublic] = []

    class Config:
        from_attributes = True


class CategoryPublic(BaseModel):
    PK_Category: int
    Name: str

    class Config:
        from_attributes = True


class BrandPublic(BaseModel):
    PK_Brand: int
    Name: str
    Note: Optional[str]

    class Config:
        from_attributes = True
