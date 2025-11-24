from typing import Optional

from pydantic import BaseModel


class CartItemAdd(BaseModel):
    variation_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    PK_CartItem: int
    Customer_id: int
    Quantity: int
    Status: str
    VariationID: int
    variation_name: Optional[str] = None
    Price: Optional[float] = None

    class Config:
        from_attributes = True
