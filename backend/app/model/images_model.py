from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.base_class import Base


class Images(Base):
    __tablename__ = "images"

    PK_Images = Column("pk_images", Integer, primary_key=True, index=True)
    ProductID = Column("productid", Integer, ForeignKey("product.pk_product", ondelete="CASCADE"))
    VariationID = Column("variationid", Integer, ForeignKey("variation.pk_variation", ondelete="CASCADE"))
    Id_Image = Column("id_image", String(255))
    Set_Default = Column("set_default", Boolean, default=False)

    product = relationship("Product", back_populates="images")
    variation = relationship("Variation", back_populates="images")
