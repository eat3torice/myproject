from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database.base_class import Base


class Role(Base):
    __tablename__ = "role"
    PK_Role = Column("pk_role", Integer, primary_key=True, index=True)
    Name = Column("name", String(100), nullable=False)

    # Quan hệ ngược lại với Account
    accounts = relationship("Account", back_populates="role")
