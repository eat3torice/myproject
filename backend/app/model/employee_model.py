from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.base_class import Base


class Employee(Base):
    __tablename__ = "employee"

    PK_Employee = Column("pk_employee", Integer, primary_key=True, index=True)
    AccountID = Column("accountid", Integer, ForeignKey("account.pk_account"), unique=True)
    Name = Column("name", String(255))
    Phone = Column("phone", String(20))
    Email = Column("email", String(255))
    Status = Column("status", String(20), default="ACTIVE")
    Creation_date = Column("creation_date", TIMESTAMP)
    Edit_date = Column("edit_date", TIMESTAMP)

    account = relationship("Account", back_populates="employee")
