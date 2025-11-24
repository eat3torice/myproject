from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database.base_class import Base


class Category(Base):
    __tablename__ = "category"

    PK_Category = Column("pk_category", Integer, primary_key=True, index=True)
    Name = Column("name", String(255))
    Status = Column("status", String(50))

    products = relationship("Product", back_populates="category")
