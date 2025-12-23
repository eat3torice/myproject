from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin_account
from app.database.session import get_db
from app.model.account_model import Account
from app.schema.brand_schema import BrandCreate, BrandResponse, BrandUpdate
from app.service.brand_service import BrandService

router = APIRouter(prefix="/admin/brands", tags=["Admin - Brands"])


@router.get("/", response_model=List[BrandResponse])
def list_brands(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    name: str = Query(None, description="Lọc theo tên thương hiệu (không phân biệt hoa thường)"),
    status: str = Query(None, description="Lọc theo trạng thái (active/inactive)"),
    db: Session = Depends(get_db),
    current_admin: Account = Depends(get_current_admin_account)
):
    """Lấy danh sách tất cả thương hiệu với khả năng lọc và phân trang"""
    service = BrandService(db)
    return service.get_brands(skip, limit, name, status)


@router.get("/{brand_id}", response_model=BrandResponse)
def get_brand(brand_id: int, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Lấy chi tiết một thương hiệu"""
    service = BrandService(db)
    brand = service.get_brand_by_id(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.post("/", response_model=BrandResponse)
def create_brand(brand: BrandCreate, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Tạo thương hiệu mới"""
    service = BrandService(db)
    return service.create_brand(brand)


@router.put("/{brand_id}", response_model=BrandResponse)
def update_brand(brand_id: int, brand: BrandUpdate, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Cập nhật thương hiệu"""
    service = BrandService(db)
    updated = service.update_brand(brand_id, brand)
    if not updated:
        raise HTTPException(status_code=404, detail="Brand not found")
    return updated


@router.delete("/{brand_id}")
def delete_brand(brand_id: int, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Xóa thương hiệu"""
    service = BrandService(db)
    deleted = service.delete_brand(brand_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Brand not found")
    return {"message": "Brand deleted successfully"}
