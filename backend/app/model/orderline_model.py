from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.database.base_class import Base


class OrderLine(Base):
    __tablename__ = "orderline"

    PK_OrderLine = Column("pk_orderline", Integer, primary_key=True, index=True)
    OrderID = Column("orderid", Integer, ForeignKey("posorder.pk_posorder", ondelete="CASCADE"))
    VariationID = Column("variationid", Integer, ForeignKey("variation.pk_variation", ondelete="SET NULL"))
    Quantity = Column("quantity", Integer)
    Unit_Price = Column("unit_price", Numeric(12, 2))
    Price = Column("price", Numeric(12, 2))
    Status = Column("status", String(50))
    Creation_date = Column("creation_date", TIMESTAMP)
    Edit_date = Column("edit_date", TIMESTAMP)

    variation = relationship("Variation")
