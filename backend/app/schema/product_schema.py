from typing import List, Optional

from pydantic import BaseModel


class ImagesSchema(BaseModel):
    PK_Images: Optional[int]
    Id_Image: str
    Set_Default: bool = False

    class Config:
        from_attributes = True


class VariationSchema(BaseModel):
    PK_Variation: Optional[int]
    SKU: str
    Name: Optional[str]
    Price: Optional[float]
    Quantity: Optional[int] = 0
    Color: Optional[str]
    Material: Optional[str]
    Size: Optional[str]
    Description: Optional[str]
    Sold: Optional[int] = 0
    Status: Optional[str] = "active"
    images: Optional[List[ImagesSchema]] = []

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    Name: str
    Images: Optional[str]
    CategoryID: int
    BrandID: int

    class Config:
        from_attributes = True


class ProductResponse(ProductCreate):
    PK_Product: int
    variations: Optional[List[VariationSchema]] = []

    class Config:
        from_attributes = True
