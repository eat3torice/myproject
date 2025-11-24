from sqlalchemy import Column, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.database.base_class import Base


class Variation(Base):
    __tablename__ = "variation"

    PK_Variation = Column("pk_variation", Integer, primary_key=True, index=True)
    ProductID = Column("productid", Integer, ForeignKey("product.pk_product", ondelete="CASCADE"))
    SKU = Column("sku", String(100), unique=True, nullable=False)
    Name = Column("name", String(255))
    Price = Column("price", Numeric(12, 2))
    Quantity = Column("quantity", Integer, default=0)
    Color = Column("color", String(100))
    Material = Column("material", String(100))
    Size = Column("size", String(100))
    Description = Column("description", Text)
    Sold = Column("sold", Integer, default=0)
    Status = Column("status", String(50))

    product = relationship("Product", back_populates="variations")
    images = relationship("Images", back_populates="variation", cascade="all, delete-orphan")
