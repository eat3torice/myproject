from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint

from app.database.base_class import Base


class CartVariation(Base):
    __tablename__ = "cart_variation"

    PK_CartVariation = Column("pk_cart_variation", Integer, primary_key=True, index=True)
    CartItemID = Column("cartitem_id", Integer, ForeignKey("cartitem.pk_cartitem", ondelete="CASCADE"))
    VariationID = Column("variation_id", Integer, ForeignKey("variation.pk_variation"))

    __table_args__ = (UniqueConstraint("cartitem_id", name="uq_cartitem_id"),)
