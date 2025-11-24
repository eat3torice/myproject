from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.base_class import Base


class Brand(Base):
    __tablename__ = "brand"

    PK_Brand = Column("pk_brand", Integer, primary_key=True, index=True)
    Name = Column("name", String(255))
    Note = Column("note", Text)
    Status = Column("status", String(50))

    products = relationship("Product", back_populates="brand")
