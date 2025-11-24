from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.base_class import Base


class Account(Base):
    __tablename__ = "account"

    PK_Account = Column("pk_account", Integer, primary_key=True, index=True)
    Username = Column("username", String(100), unique=True, nullable=False)
    Password = Column("password", String(255), nullable=False)
    RoleID = Column("roleid", Integer, ForeignKey("role.pk_role"), nullable=False)
    Status = Column("status", String(50), nullable=False, default="ACTIVE")

    role = relationship("Role")
    employee = relationship("Employee", back_populates="account", uselist=False)
    customer = relationship("Customer", back_populates="account", uselist=False)
