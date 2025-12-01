from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class EmployeeCreate(BaseModel):
    AccountID: int
    Name: str
    Phone: Optional[str] = None
    Email: Optional[EmailStr] = None

    class Config:
        from_attributes = True


class EmployeeUpdate(BaseModel):
    Name: Optional[str] = None
    Phone: Optional[str] = None
    Email: Optional[EmailStr] = None

    class Config:
        from_attributes = True


class EmployeeResponse(BaseModel):
    PK_Employee: int
    AccountID: int
    Name: str
    Phone: Optional[str]
    Email: Optional[str]
    Status: Optional[str]  # Account status
    Creation_date: Optional[datetime]
    Edit_date: Optional[datetime]

    class Config:
        from_attributes = True
