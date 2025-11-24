from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schema.category_schema import CategoryCreate, CategoryResponse, CategoryUpdate
from app.service.category_service import CategoryService

router = APIRouter(prefix="/admin/categories", tags=["Admin - Categories"])


@router.get("/", response_model=List[CategoryResponse])
def list_categories(skip: int = Query(0, ge=0), limit: int = Query(100, le=1000), db: Session = Depends(get_db)):
    """Lấy danh sách tất cả danh mục"""
    service = CategoryService(db)
    return service.get_categories(skip, limit)


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """Lấy chi tiết một danh mục"""
    service = CategoryService(db)
    category = service.get_category_by_id(category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.post("/", response_model=CategoryResponse)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Tạo danh mục mới"""
    service = CategoryService(db)
    return service.create_category(category)


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    """Cập nhật danh mục"""
    service = CategoryService(db)
    updated = service.update_category(category_id, category)
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated


@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    """Xóa danh mục"""
    service = CategoryService(db)
    deleted = service.delete_category(category_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}
