import shutil
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin_account
from app.database.session import get_db
from app.model.account_model import Account
from app.model.images_model import Images
from app.schema.variation_schema import VariationCreate, VariationResponse, VariationUpdate
from app.service.variation_service import VariationService

router = APIRouter(prefix="/admin/variations", tags=["Admin - Variations"])


@router.get("/", response_model=List[VariationResponse])
def list_variations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    product_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_admin: Account = Depends(get_current_admin_account)
):
    """Lấy danh sách tất cả biến thể sản phẩm"""
    service = VariationService(db)
    return service.get_variations(skip, limit, product_id)


@router.get("/{variation_id}", response_model=VariationResponse)
def get_variation(variation_id: int, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Lấy chi tiết một biến thể"""
    service = VariationService(db)
    variation = service.get_variation_by_id(variation_id)
    if not variation:
        raise HTTPException(status_code=404, detail="Variation not found")
    return variation


@router.post("/", response_model=VariationResponse)
def create_variation(variation: VariationCreate, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Tạo biến thể mới"""
    service = VariationService(db)
    try:
        return service.create_variation(variation)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{variation_id}", response_model=VariationResponse)
def update_variation(variation_id: int, variation: VariationUpdate, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Cập nhật biến thể"""
    service = VariationService(db)
    try:
        updated = service.update_variation(variation_id, variation)
        if not updated:
            raise HTTPException(status_code=404, detail="Variation not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{variation_id}")
def delete_variation(variation_id: int, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Xóa biến thể"""
    service = VariationService(db)
    deleted = service.delete_variation(variation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Variation not found")
    return {"message": "Variation deleted successfully"}


@router.patch("/{variation_id}/quantity")
def update_variation_quantity(variation_id: int, quantity_change: int, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Cập nhật số lượng biến thể (+ để nhập kho, - để xuất kho)"""
    service = VariationService(db)
    updated = service.update_quantity(variation_id, quantity_change)
    if not updated:
        raise HTTPException(status_code=404, detail="Variation not found")
    return updated


@router.post("/{variation_id}/add-image-url", response_model=dict)
def add_variation_image_url(
    variation_id: int,
    image_url: str,
    set_default: bool = False,
    db: Session = Depends(get_db),
    current_admin: Account = Depends(get_current_admin_account)
):
    """Thêm URL ảnh cho variation (từ CDN hoặc external source) - tối đa 3 ảnh"""
    service = VariationService(db)
    variation = service.get_variation_by_id(variation_id)
    if not variation:
        raise HTTPException(status_code=404, detail="Variation not found")

    # Kiểm tra số lượng ảnh hiện tại
    existing_images = db.query(Images).filter(Images.VariationID == variation_id).count()
    if existing_images >= 3:
        raise HTTPException(status_code=400, detail="Maximum 3 images per variation")

    # Lưu URL trực tiếp vào database
    new_image = Images(VariationID=variation_id, Id_Image=image_url, Set_Default=set_default)
    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return {"image_url": image_url, "image_id": new_image.PK_Images}


UPLOAD_DIR = Path("static/images")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/{variation_id}/upload-image", response_model=dict)
def upload_variation_image(
    variation_id: int,
    file: UploadFile = File(...),
    set_default: bool = False,
    db: Session = Depends(get_db),
    current_admin: Account = Depends(get_current_admin_account)
):
    """Upload ảnh cho variation và lưu vào bảng images (local storage - deprecated, dùng add-image-url thay thế)"""
    service = VariationService(db)
    variation = service.get_variation_by_id(variation_id)
    if not variation:
        raise HTTPException(status_code=404, detail="Variation not found")

    # Lưu file local
    file_path = UPLOAD_DIR / f"variation_{variation_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"/static/images/{file_path.name}"

    # Lưu vào bảng images
    new_image = Images(VariationID=variation_id, Id_Image=image_url, Set_Default=set_default)
    db.add(new_image)
    db.commit()
    db.refresh(new_image)

    return {"image_url": image_url, "image_id": new_image.PK_Images}
