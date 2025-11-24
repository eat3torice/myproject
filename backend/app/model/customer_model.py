from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.base_class import Base


class Customer(Base):
    __tablename__ = "customer"

    PK_Customer = Column("pk_customer", Integer, primary_key=True, index=True)
    AccountID = Column("accountid", Integer, ForeignKey("account.pk_account"), unique=True)
    Name = Column("name", String(255))
    Address = Column("address", Text)
    Phone = Column("phone", String(20))
    Note = Column("note", Text)
    Status = Column("status", String(50))
    Creation_date = Column("creation_date", TIMESTAMP)
    Edit_date = Column("edit_date", TIMESTAMP)

    account = relationship("Account", back_populates="customer")
