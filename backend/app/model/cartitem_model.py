from sqlalchemy import Column, ForeignKey, Integer, String

from app.database.base_class import Base


class CartItem(Base):
    __tablename__ = "cartitem"

    PK_CartItem = Column("pk_cartitem", Integer, primary_key=True, index=True)
    Customer_id = Column("customer_id", Integer, ForeignKey("customer.pk_customer"))
    Quantity = Column("quantity", Integer)
    Status = Column("status", String(50))
