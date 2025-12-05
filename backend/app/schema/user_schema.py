from typing import Optional

from pydantic import BaseModel


class UserRegister(BaseModel):
    username: str
    password: str
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class UserProfile(BaseModel):
    PK_Customer: int
    AccountID: int
    Name: str
    Phone: Optional[str]
    Address: Optional[str]
    Status: Optional[str]

    class Config:
        from_attributes = True


class UpdateProfile(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True


class ChangePassword(BaseModel):
    old_password: str
    new_password: str


class ForgotPasswordRequest(BaseModel):
    username: str
    phone: str


class ResetPassword(BaseModel):
    username: str
    phone: str
    new_password: str
