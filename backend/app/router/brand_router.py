from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schema.brand_schema import BrandCreate, BrandResponse, BrandUpdate
from app.service.brand_service import BrandService

router = APIRouter(prefix="/admin/brands", tags=["Admin - Brands"])


@router.get("/", response_model=List[BrandResponse])
def list_brands(skip: int = Query(0, ge=0), limit: int = Query(100, le=1000), db: Session = Depends(get_db)):
    """Lấy danh sách tất cả thương hiệu"""
    service = BrandService(db)
    return service.get_brands(skip, limit)


@router.get("/{brand_id}", response_model=BrandResponse)
def get_brand(brand_id: int, db: Session = Depends(get_db)):
    """Lấy chi tiết một thương hiệu"""
    service = BrandService(db)
    brand = service.get_brand_by_id(brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.post("/", response_model=BrandResponse)
def create_brand(brand: BrandCreate, db: Session = Depends(get_db)):
    """Tạo thương hiệu mới"""
    service = BrandService(db)
    return service.create_brand(brand)


@router.put("/{brand_id}", response_model=BrandResponse)
def update_brand(brand_id: int, brand: BrandUpdate, db: Session = Depends(get_db)):
    """Cập nhật thương hiệu"""
    service = BrandService(db)
    updated = service.update_brand(brand_id, brand)
    if not updated:
        raise HTTPException(status_code=404, detail="Brand not found")
    return updated


@router.delete("/{brand_id}")
def delete_brand(brand_id: int, db: Session = Depends(get_db)):
    """Xóa thương hiệu"""
    service = BrandService(db)
    deleted = service.delete_brand(brand_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Brand not found")
    return {"message": "Brand deleted successfully"}
