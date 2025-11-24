from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schema.public_schema import BrandPublic, CategoryPublic, ProductPublic, ProductVariationPublic
from app.service.public_service import PublicProductService

router = APIRouter(prefix="/products", tags=["Public - Products"])


@router.get("/", response_model=List[ProductVariationPublic])
def list_product_variations(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Lấy danh sách biến thể sản phẩm (công khai) - hiển thị random variations"""
    service = PublicProductService(db)
    return service.get_variations(skip, limit, category_id, brand_id, search)


@router.get("/featured", response_model=List[ProductVariationPublic])
def get_featured_variations(limit: int = Query(10, le=50), db: Session = Depends(get_db)):
    """Lấy biến thể sản phẩm nổi bật/bán chạy"""
    service = PublicProductService(db)
    return service.get_featured_variations(limit)


@router.get("/search", response_model=List[ProductVariationPublic])
def search_variations(
    keyword: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db),
):
    """Tìm kiếm biến thể sản phẩm"""
    service = PublicProductService(db)
    return service.search_variations(keyword, skip, limit)


@router.get("/categories", response_model=List[CategoryPublic])
def list_categories(db: Session = Depends(get_db)):
    """Lấy danh sách danh mục"""
    service = PublicProductService(db)
    return service.get_categories()


@router.get("/brands", response_model=List[BrandPublic])
def list_brands(db: Session = Depends(get_db)):
    """Lấy danh sách thương hiệu"""
    service = PublicProductService(db)
    return service.get_brands()


@router.get("/variation/{variation_id}", response_model=ProductVariationPublic)
def get_variation_detail(variation_id: int, db: Session = Depends(get_db)):
    """Lấy chi tiết một biến thể sản phẩm"""
    service = PublicProductService(db)
    variation = service.get_variation_detail(variation_id)
    if not variation:
        raise HTTPException(status_code=404, detail="Product variation not found")
    return variation


@router.get("/{product_id}", response_model=ProductPublic)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    """Lấy chi tiết sản phẩm (với tất cả variations)"""
    service = PublicProductService(db)
    product = service.get_product_detail(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
