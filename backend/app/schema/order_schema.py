from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel


class OrderLineCreate(BaseModel):
    VariationID: int
    Quantity: int
    Unit_Price: Decimal

    class Config:
        from_attributes = True


class OrderLineResponse(BaseModel):
    PK_OrderLine: int
    OrderID: int
    VariationID: Optional[int]
    VariationName: Optional[str] = None
    Quantity: int
    Unit_Price: Decimal
    Price: Decimal
    Status: Optional[str]
    Creation_date: Optional[datetime]

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    CustomerID: Optional[int] = None
    EmployeeID: Optional[int] = None  # Allow None for online orders
    PaymentMethodID: int
    AddressID: Optional[int] = None  # Địa chỉ giao hàng
    Note: Optional[str] = None
    Type_Order: str = "POS"  # POS hoặc Online
    order_lines: List[OrderLineCreate]

    class Config:
        from_attributes = True


class OrderUpdate(BaseModel):
    Status: Optional[str] = None
    Note: Optional[str] = None
    Payment_Date: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    PK_POSOrder: int
    CustomerID: Optional[int]
    EmployeeID: Optional[int]
    AddressID: Optional[int]
    Creation_date: Optional[datetime]
    Total_Amount: Decimal
    Total_Payment: Decimal
    PaymentMethodID: int
    Note: Optional[str]
    Status: str
    Order_Date: Optional[datetime]
    Payment_Date: Optional[datetime]
    Type_Order: str
    ShippingAddress: Optional[str] = None  # Full address string

    class Config:
        from_attributes = True


class OrderDetailResponse(OrderResponse):
    order_lines: List[OrderLineResponse] = []

    class Config:
        from_attributes = True
