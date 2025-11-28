from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_account
from app.database.session import get_db
from app.schema.address_schema import (
    AddressCreate,
    AddressResponse,
    AddressUpdate,
    DistrictResponse,
    ProvinceResponse,
    WardResponse,
)
from app.service.address_service import AddressService
from app.service.user_service import UserService

router = APIRouter(prefix="/user/addresses", tags=["User - Addresses"])


def get_current_customer_id(current_account=Depends(get_current_account), db: Session = Depends(get_db)):
    """Helper để lấy customer_id từ account hiện tại"""
    user_service = UserService(db)
    customer = user_service.get_user_profile(current_account.PK_Account)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    return customer.PK_Customer


@router.get("/provinces", response_model=List[ProvinceResponse])
def get_provinces(db: Session = Depends(get_db)):
    """Lấy danh sách tỉnh/thành phố"""
    service = AddressService(db)
    provinces = service.get_provinces()
    return provinces


@router.get("/districts/{province_id}", response_model=List[DistrictResponse])
def get_districts_by_province(province_id: int, db: Session = Depends(get_db)):
    """Lấy danh sách quận/huyện theo tỉnh"""
    service = AddressService(db)
    districts = service.get_districts_by_province(province_id)
    return districts


@router.get("/wards/{district_id}", response_model=List[WardResponse])
def get_wards_by_district(district_id: int, db: Session = Depends(get_db)):
    """Lấy danh sách phường/xã theo quận/huyện"""
    service = AddressService(db)
    wards = service.get_wards_by_district(district_id)
    return wards


@router.get("/", response_model=List[AddressResponse])
def get_my_addresses(customer_id: int = Depends(get_current_customer_id), db: Session = Depends(get_db)):
    """Lấy danh sách địa chỉ của user"""
    service = AddressService(db)
    addresses = service.get_customer_addresses(customer_id)

    # Add province, district, ward names
    result = []
    for addr in addresses:
        province = service.get_province_by_id(addr.ProvinceID)
        district = service.get_district_by_id(addr.DistrictID)
        ward = service.get_ward_by_id(addr.WardID)

        addr_dict = {
            'PK_Address': addr.PK_Address,
            'CustomerID': addr.CustomerID,
            'ProvinceID': addr.ProvinceID,
            'DistrictID': addr.DistrictID,
            'WardID': addr.WardID,
            'StreetAddress': addr.StreetAddress,
            'IsDefault': addr.IsDefault,
            'ProvinceName': province.Name if province else None,
            'DistrictName': district.Name if district else None,
            'WardName': ward.Name if ward else None,
            'Creation_date': addr.Creation_date,
            'Edit_date': addr.Edit_date,
        }
        result.append(addr_dict)

    return result


@router.get("/{address_id}", response_model=AddressResponse)
def get_address_detail(
    address_id: int,
    customer_id: int = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    """Lấy chi tiết địa chỉ"""
    service = AddressService(db)
    address = service.get_address_by_id(address_id, customer_id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    province = service.get_province_by_id(address.ProvinceID)
    district = service.get_district_by_id(address.DistrictID)
    ward = service.get_ward_by_id(address.WardID)

    return {
        'PK_Address': address.PK_Address,
        'CustomerID': address.CustomerID,
        'ProvinceID': address.ProvinceID,
        'DistrictID': address.DistrictID,
        'WardID': address.WardID,
        'StreetAddress': address.StreetAddress,
        'IsDefault': address.IsDefault,
        'ProvinceName': province.Name if province else None,
        'DistrictName': district.Name if district else None,
        'WardName': ward.Name if ward else None,
        'Creation_date': address.Creation_date,
        'Edit_date': address.Edit_date,
    }


@router.post("/", response_model=AddressResponse)
def create_address(
    address: AddressCreate,
    customer_id: int = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    """Tạo địa chỉ mới"""
    service = AddressService(db)

    # Validate province, district, ward exist
    if not service.get_province_by_id(address.ProvinceID):
        raise HTTPException(status_code=400, detail="Invalid province")
    if not service.get_district_by_id(address.DistrictID):
        raise HTTPException(status_code=400, detail="Invalid district")
    if not service.get_ward_by_id(address.WardID):
        raise HTTPException(status_code=400, detail="Invalid ward")

    try:
        new_address = service.create_address(customer_id, address)

        province = service.get_province_by_id(new_address.ProvinceID)
        district = service.get_district_by_id(new_address.DistrictID)
        ward = service.get_ward_by_id(new_address.WardID)

        return {
            'PK_Address': new_address.PK_Address,
            'CustomerID': new_address.CustomerID,
            'ProvinceID': new_address.ProvinceID,
            'DistrictID': new_address.DistrictID,
            'WardID': new_address.WardID,
            'StreetAddress': new_address.StreetAddress,
            'IsDefault': new_address.IsDefault,
            'ProvinceName': province.Name if province else None,
            'DistrictName': district.Name if district else None,
            'WardName': ward.Name if ward else None,
            'Creation_date': new_address.Creation_date,
            'Edit_date': new_address.Edit_date,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: int,
    address_update: AddressUpdate,
    customer_id: int = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    """Cập nhật địa chỉ"""
    service = AddressService(db)

    # Validate if updating province/district/ward
    if address_update.ProvinceID and not service.get_province_by_id(address_update.ProvinceID):
        raise HTTPException(status_code=400, detail="Invalid province")
    if address_update.DistrictID and not service.get_district_by_id(address_update.DistrictID):
        raise HTTPException(status_code=400, detail="Invalid district")
    if address_update.WardID and not service.get_ward_by_id(address_update.WardID):
        raise HTTPException(status_code=400, detail="Invalid ward")

    updated = service.update_address(address_id, customer_id, address_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Address not found")

    province = service.get_province_by_id(updated.ProvinceID)
    district = service.get_district_by_id(updated.DistrictID)
    ward = service.get_ward_by_id(updated.WardID)

    return {
        'PK_Address': updated.PK_Address,
        'CustomerID': updated.CustomerID,
        'ProvinceID': updated.ProvinceID,
        'DistrictID': updated.DistrictID,
        'WardID': updated.WardID,
        'StreetAddress': updated.StreetAddress,
        'IsDefault': updated.IsDefault,
        'ProvinceName': province.Name if province else None,
        'DistrictName': district.Name if district else None,
        'WardName': ward.Name if ward else None,
        'Creation_date': updated.Creation_date,
        'Edit_date': updated.Edit_date,
    }


@router.delete("/{address_id}")
def delete_address(
    address_id: int,
    customer_id: int = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    """Xóa địa chỉ"""
    service = AddressService(db)
    deleted = service.delete_address(address_id, customer_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"message": "Address deleted successfully"}


@router.post("/{address_id}/set-default")
def set_default_address(
    address_id: int,
    customer_id: int = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    """Đặt địa chỉ làm mặc định"""
    service = AddressService(db)
    address = service.set_default_address(address_id, customer_id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"message": "Address set as default successfully"}
