from typing import List, Optional
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schema.product_schema import ProductCreate, ProductResponse
from app.service.product_service import ProductService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/products", tags=["Admin - Products"])


@router.get("/", response_model=List[ProductResponse])
def list_products(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, le=100, description="Maximum number of records to return"),
    name: Optional[str] = Query(None, description="Filter by product name (partial match)"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    brand_id: Optional[int] = Query(None, description="Filter by brand ID"),
    db: Session = Depends(get_db)
):
    logger.info(f"GET /admin/products - skip={skip}, limit={limit}, name={name}, category_id={category_id}, brand_id={brand_id}")
    service = ProductService(db)
    products = service.get_products(skip=skip, limit=limit, name=name, category_id=category_id, brand_id=brand_id)
    logger.info(f"GET /admin/products - returned {len(products)} products")
    return products


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    logger.info(f"GET /admin/products/{product_id}")
    service = ProductService(db)
    product = service.get_product_by_id(product_id)
    if not product:
        logger.warning(f"GET /admin/products/{product_id} - Product not found")
        raise HTTPException(status_code=404, detail="Product not found")
    logger.info(f"GET /admin/products/{product_id} - Product found: {product.name}")
    return product


@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    logger.info(f"POST /admin/products - Creating product: {product.name}")
    service = ProductService(db)
    created = service.create_product(product)
    logger.info(f"POST /admin/products - Product created with ID: {created.id}")
    return created


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db)):
    logger.info(f"PUT /admin/products/{product_id} - Updating product: {product.name}")
    service = ProductService(db)
    updated = service.update_product(product_id, product)
    if not updated:
        logger.warning(f"PUT /admin/products/{product_id} - Product not found")
        raise HTTPException(status_code=404, detail="Product not found")
    logger.info(f"PUT /admin/products/{product_id} - Product updated successfully")
    return updated


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    logger.info(f"DELETE /admin/products/{product_id}")
    service = ProductService(db)
    deleted = service.delete_product(product_id)
    if not deleted:
        logger.warning(f"DELETE /admin/products/{product_id} - Product not found")
        raise HTTPException(status_code=404, detail="Product not found")
    logger.info(f"DELETE /admin/products/{product_id} - Product deleted successfully")
    return {"message": "Product deleted successfully"}
