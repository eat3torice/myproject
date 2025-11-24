from sqlalchemy.orm import Session

from app.model.brand_model import Brand
from app.schema.brand_schema import BrandCreate, BrandUpdate


class BrandService:
    def __init__(self, db: Session):
        self.db = db

    def get_brands(self, skip: int = 0, limit: int = 100):
        return self.db.query(Brand).offset(skip).limit(limit).all()

    def get_brand_by_id(self, brand_id: int):
        return self.db.query(Brand).filter(Brand.PK_Brand == brand_id).first()

    def create_brand(self, brand_data: BrandCreate):
        db_brand = Brand(Name=brand_data.Name, Note=brand_data.Note, Status=brand_data.Status)
        self.db.add(db_brand)
        self.db.commit()
        self.db.refresh(db_brand)
        return db_brand

    def update_brand(self, brand_id: int, brand_data: BrandUpdate):
        brand = self.db.query(Brand).filter(Brand.PK_Brand == brand_id).first()
        if not brand:
            return None

        for key, value in brand_data.dict(exclude_unset=True).items():
            setattr(brand, key, value)

        self.db.commit()
        self.db.refresh(brand)
        return brand

    def delete_brand(self, brand_id: int):
        brand = self.db.query(Brand).filter(Brand.PK_Brand == brand_id).first()
        if not brand:
            return None

        self.db.delete(brand)
        self.db.commit()
        return brand
