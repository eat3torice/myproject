from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.base_class import Base


class Product(Base):
    __tablename__ = "product"

    PK_Product = Column("pk_product", Integer, primary_key=True, index=True)
    Name = Column("name", String(255))
    Images = Column("images", Text)
    CategoryID = Column("categoryid", Integer, ForeignKey("category.pk_category"))
    BrandID = Column("brandid", Integer, ForeignKey("brand.pk_brand"))

    category = relationship("Category", back_populates="products")
    brand = relationship("Brand", back_populates="products")
    variations = relationship("Variation", back_populates="product", cascade="all, delete-orphan")
    images = relationship("Images", back_populates="product", cascade="all, delete-orphan")
