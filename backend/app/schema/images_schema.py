from pydantic import BaseModel
from typing import Optional

class ImagesBase(BaseModel):
    ProductID: Optional[int] = None
    VariationID: Optional[int] = None
    Id_Image: str  # URL hoặc path ảnh
    Set_Default: bool = False

class ImagesCreate(ImagesBase):
    pass

class ImagesUpdate(BaseModel):
    ProductID: Optional[int] = None
    VariationID: Optional[int] = None
    Id_Image: Optional[str] = None
    Set_Default: Optional[bool] = None

class ImagesResponse(ImagesBase):
    PK_Images: int

    class Config:
        from_attributes = True