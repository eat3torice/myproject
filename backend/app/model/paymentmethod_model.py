from sqlalchemy import Column, Integer, String, Text

from app.database.base_class import Base


class PaymentMethod(Base):
    __tablename__ = "paymentmethod"

    PK_PaymentMethod = Column("pk_paymentmethod", Integer, primary_key=True, index=True)
    Type = Column("type", String(100))
    Note = Column("note", Text)
    Status = Column("status", String(50))
