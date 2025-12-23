from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin_account
from app.database.session import get_db
from app.model.account_model import Account
from app.schema.images_schema import ImagesCreate, ImagesResponse, ImagesUpdate
from app.service.imgage_service import ImagesService

router = APIRouter(prefix="/admin/images", tags=["Admin - Images"])

@router.get("/", response_model=List[ImagesResponse])
def list_images(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    product_id: Optional[int] = None,
    variation_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_admin: Account = Depends(get_current_admin_account)
):
    """Lấy danh sách tất cả ảnh"""
    service = ImagesService(db)
    return service.get_images(skip, limit, product_id, variation_id)

@router.get("/{image_id}", response_model=ImagesResponse)
def get_image(image_id: int, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Lấy chi tiết một ảnh"""
    service = ImagesService(db)
    image = service.get_image_by_id(image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return image

@router.post("/", response_model=ImagesResponse)
def create_image(image: ImagesCreate, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Tạo ảnh mới"""
    service = ImagesService(db)
    return service.create_image(image)

@router.put("/{image_id}", response_model=ImagesResponse)
def update_image(image_id: int, image: ImagesUpdate, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Cập nhật ảnh"""
    service = ImagesService(db)
    updated = service.update_image(image_id, image)
    if not updated:
        raise HTTPException(status_code=404, detail="Image not found")
    return updated

@router.delete("/{image_id}")
def delete_image(image_id: int, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Xóa ảnh"""
    service = ImagesService(db)
    if not service.delete_image(image_id):
        raise HTTPException(status_code=404, detail="Image not found")
    return {"message": "Image deleted successfully"}
