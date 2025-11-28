from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProvinceBase(BaseModel):
    Name: str
    Code: str


class ProvinceCreate(ProvinceBase):
    pass


class ProvinceResponse(ProvinceBase):
    PK_Province: int

    class Config:
        from_attributes = True


class DistrictBase(BaseModel):
    ProvinceID: int
    Name: str
    Code: str


class DistrictCreate(DistrictBase):
    pass


class DistrictResponse(DistrictBase):
    PK_District: int

    class Config:
        from_attributes = True


class WardBase(BaseModel):
    DistrictID: int
    Name: str
    Code: str


class WardCreate(WardBase):
    pass


class WardResponse(WardBase):
    PK_Ward: int

    class Config:
        from_attributes = True


class AddressBase(BaseModel):
    ProvinceID: int
    DistrictID: int
    WardID: int
    StreetAddress: str
    IsDefault: Optional[int] = 0


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    ProvinceID: Optional[int] = None
    DistrictID: Optional[int] = None
    WardID: Optional[int] = None
    StreetAddress: Optional[str] = None
    IsDefault: Optional[int] = None


class AddressResponse(AddressBase):
    PK_Address: int
    CustomerID: int
    ProvinceName: Optional[str] = None
    DistrictName: Optional[str] = None
    WardName: Optional[str] = None
    Creation_date: Optional[datetime]
    Edit_date: Optional[datetime]

    class Config:
        from_attributes = True
