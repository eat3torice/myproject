from typing import Optional

from sqlalchemy.orm import Session

from app.model.brand_model import Brand
from app.schema.brand_schema import BrandCreate, BrandUpdate
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

class BrandService:
    def __init__(self, db: Session):
        self.db = db

    def get_brands(self, skip: int = 0, limit: int = 100, name: Optional[str] = None, status: Optional[str] = None):
        query = self.db.query(Brand)

        # Apply filters
        if name:
            query = query.filter(Brand.Name.ilike(f"%{name}%"))
        if status:
            query = query.filter(Brand.Status == status)
        brands = query.offset(skip).limit(limit).all()
        logger.info(f"Fetching brands with filters - Name:")
        for idx, b in enumerate(brands,1):
            logger.info(f"[{idx}] ID:{b.PK_Brand} {b.Name} - Status:{b.Status}")
        return brands 

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
