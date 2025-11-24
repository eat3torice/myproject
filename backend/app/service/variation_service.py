from sqlalchemy.orm import Session

from app.model.variation_model import Variation
from app.schema.variation_schema import VariationCreate, VariationUpdate


class VariationService:
    def __init__(self, db: Session):
        self.db = db

    def get_variations(self, skip: int = 0, limit: int = 100, product_id: int = None):
        query = self.db.query(Variation)
        if product_id:
            query = query.filter(Variation.ProductID == product_id)
        return query.offset(skip).limit(limit).all()

    def get_variation_by_id(self, variation_id: int):
        return self.db.query(Variation).filter(Variation.PK_Variation == variation_id).first()

    def get_variation_by_sku(self, sku: str):
        return self.db.query(Variation).filter(Variation.SKU == sku).first()

    def create_variation(self, variation_data: VariationCreate):
        # Check if SKU already exists
        existing = self.get_variation_by_sku(variation_data.SKU)
        if existing:
            raise ValueError("SKU already exists")

        db_variation = Variation(
            ProductID=variation_data.ProductID,
            SKU=variation_data.SKU,
            Name=variation_data.Name,
            Price=variation_data.Price,
            Quantity=variation_data.Quantity,
            Color=variation_data.Color,
            Material=variation_data.Material,
            Size=variation_data.Size,
            Description=variation_data.Description,
            Status=variation_data.Status,
            Sold=0,
        )
        self.db.add(db_variation)
        self.db.commit()
        self.db.refresh(db_variation)
        return db_variation

    def update_variation(self, variation_id: int, variation_data: VariationUpdate):
        variation = self.db.query(Variation).filter(Variation.PK_Variation == variation_id).first()
        if not variation:
            return None

        # Check SKU uniqueness if updating SKU
        if variation_data.SKU and variation_data.SKU != variation.SKU:
            existing = self.get_variation_by_sku(variation_data.SKU)
            if existing:
                raise ValueError("SKU already exists")

        for key, value in variation_data.dict(exclude_unset=True).items():
            setattr(variation, key, value)

        self.db.commit()
        self.db.refresh(variation)
        return variation

    def delete_variation(self, variation_id: int):
        variation = self.db.query(Variation).filter(Variation.PK_Variation == variation_id).first()
        if not variation:
            return None

        self.db.delete(variation)
        self.db.commit()
        return variation

    def update_quantity(self, variation_id: int, quantity_change: int):
        """Update variation quantity (for sales/returns)"""
        variation = self.db.query(Variation).filter(Variation.PK_Variation == variation_id).first()
        if not variation:
            return None

        variation.Quantity += quantity_change
        if quantity_change < 0:  # Selling
            variation.Sold -= quantity_change

        self.db.commit()
        self.db.refresh(variation)
        return variation
