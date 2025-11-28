from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.model.address_model import Address, District, Province, Ward


class AddressService:
    def __init__(self, db: Session):
        self.db = db

    # Province methods
    def get_provinces(self) -> List[Province]:
        return self.db.query(Province).order_by(Province.Name).all()

    def get_province_by_id(self, province_id: int) -> Optional[Province]:
        return self.db.query(Province).filter(Province.PK_Province == province_id).first()

    # District methods
    def get_districts_by_province(self, province_id: int) -> List[District]:
        return self.db.query(District).filter(District.ProvinceID == province_id).order_by(District.Name).all()

    def get_district_by_id(self, district_id: int) -> Optional[District]:
        return self.db.query(District).filter(District.PK_District == district_id).first()

    # Ward methods
    def get_wards_by_district(self, district_id: int) -> List[Ward]:
        return self.db.query(Ward).filter(Ward.DistrictID == district_id).order_by(Ward.Name).all()

    def get_ward_by_id(self, ward_id: int) -> Optional[Ward]:
        return self.db.query(Ward).filter(Ward.PK_Ward == ward_id).first()

    # Address methods
    def get_customer_addresses(self, customer_id: int) -> List[Address]:
        return (
            self.db.query(Address)
            .filter(Address.CustomerID == customer_id)
            .order_by(Address.IsDefault.desc(), Address.Creation_date.desc())
            .all()
        )

    def get_address_by_id(self, address_id: int, customer_id: int) -> Optional[Address]:
        return self.db.query(Address).filter(
            Address.PK_Address == address_id,
            Address.CustomerID == customer_id
        ).first()

    def create_address(self, customer_id: int, address_data):
        # Set other addresses to non-default if this is default
        if address_data.IsDefault == 1:
            self.db.query(Address).filter(Address.CustomerID == customer_id).update({"IsDefault": 0})

        db_address = Address(
            CustomerID=customer_id,
            ProvinceID=address_data.ProvinceID,
            DistrictID=address_data.DistrictID,
            WardID=address_data.WardID,
            StreetAddress=address_data.StreetAddress,
            IsDefault=address_data.IsDefault,
            Creation_date=datetime.now(),
            Edit_date=datetime.now(),
        )
        self.db.add(db_address)
        self.db.commit()
        self.db.refresh(db_address)
        return db_address

    def update_address(self, address_id: int, customer_id: int, address_data):
        address = self.get_address_by_id(address_id, customer_id)
        if not address:
            return None

        # Set other addresses to non-default if this is default
        if hasattr(address_data, 'IsDefault') and address_data.IsDefault == 1:
            self.db.query(Address).filter(
                Address.CustomerID == customer_id,
                Address.PK_Address != address_id
            ).update({"IsDefault": 0})

        update_data = address_data.dict(exclude_unset=True)
        update_data["Edit_date"] = datetime.now()

        for key, value in update_data.items():
            setattr(address, key, value)

        self.db.commit()
        self.db.refresh(address)
        return address

    def delete_address(self, address_id: int, customer_id: int) -> bool:
        address = self.get_address_by_id(address_id, customer_id)
        if not address:
            return False

        self.db.delete(address)
        self.db.commit()
        return True

    def set_default_address(self, address_id: int, customer_id: int):
        # Set all addresses to non-default first
        self.db.query(Address).filter(Address.CustomerID == customer_id).update({"IsDefault": 0})

        # Set the specified address as default
        address = self.get_address_by_id(address_id, customer_id)
        if address:
            address.IsDefault = 1
            address.Edit_date = datetime.now()
            self.db.commit()
            self.db.refresh(address)
            return address
        return None
