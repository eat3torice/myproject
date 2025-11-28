from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.base_class import Base


class Province(Base):
    __tablename__ = "province"

    PK_Province = Column("pk_province", Integer, primary_key=True, index=True)
    Name = Column("name", String(255), nullable=False)
    Code = Column("code", String(20), unique=True, nullable=False)

    districts = relationship("District", back_populates="province")


class District(Base):
    __tablename__ = "district"

    PK_District = Column("pk_district", Integer, primary_key=True, index=True)
    ProvinceID = Column("provinceid", Integer, ForeignKey("province.pk_province"))
    Name = Column("name", String(255), nullable=False)
    Code = Column("code", String(20), nullable=False)

    province = relationship("Province", back_populates="districts")
    wards = relationship("Ward", back_populates="district")


class Ward(Base):
    __tablename__ = "ward"

    PK_Ward = Column("pk_ward", Integer, primary_key=True, index=True)
    DistrictID = Column("districtid", Integer, ForeignKey("district.pk_district"))
    Name = Column("name", String(255), nullable=False)
    Code = Column("code", String(20), nullable=False)

    district = relationship("District", back_populates="wards")


class Address(Base):
    __tablename__ = "address"

    PK_Address = Column("pk_address", Integer, primary_key=True, index=True)
    CustomerID = Column("customerid", Integer, ForeignKey("customer.pk_customer"))
    ProvinceID = Column("provinceid", Integer, ForeignKey("province.pk_province"))
    DistrictID = Column("districtid", Integer, ForeignKey("district.pk_district"))
    WardID = Column("wardid", Integer, ForeignKey("ward.pk_ward"))
    StreetAddress = Column("street_address", Text)
    IsDefault = Column("is_default", Integer, default=0)  # 0: No, 1: Yes
    Creation_date = Column("creation_date", TIMESTAMP)
    Edit_date = Column("edit_date", TIMESTAMP)

    customer = relationship("Customer", back_populates="addresses")
    province = relationship("Province")
    district = relationship("District")
    ward = relationship("Ward")
