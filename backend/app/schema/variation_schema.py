from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, field_validator, model_validator
from pydantic_core import ValidationError


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
    Status: Optional[str] = "ACTIVE"

    @field_validator("SKU")
    @classmethod
    def vaidate_sku(cls ,v):
        if not v.strip():
            raise ValueError("SKU khong de trong")
        if " " in v:
            raise ValueError("SKU khong chua khoang trang")
        if len(v) < 3 or len(v) > 20:
            raise ValueError("SKU phai co do dai tu 3 den 20 ky tu")
        # sau khi nhap xong tu viet hoa
        return v.upper()
    @field_validator("Quantity")
    @classmethod
    def validate_quantity(cls, value):
        if value is not None and value < 0:
            raise ValueError("Quantity must be non-negative")
        return value
    
        
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
