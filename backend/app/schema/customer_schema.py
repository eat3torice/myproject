from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CustomerCreate(BaseModel):
    AccountID: Optional[int] = None
    Name: str
    Address: Optional[str] = None
    Phone: Optional[str] = None
    Note: Optional[str] = None
    Status: Optional[str] = "active"

    class Config:
        from_attributes = True


class CustomerUpdate(BaseModel):
    Name: Optional[str] = None
    Address: Optional[str] = None
    Phone: Optional[str] = None
    Note: Optional[str] = None
    Status: Optional[str] = None

    class Config:
        from_attributes = True


class CustomerResponse(BaseModel):
    PK_Customer: int
    AccountID: Optional[int]
    Name: str
    Address: Optional[str]
    Phone: Optional[str]
    Note: Optional[str]
    Status: Optional[str]
    Creation_date: Optional[datetime]
    Edit_date: Optional[datetime]

    class Config:
        from_attributes = True
