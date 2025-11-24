from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schema.product_schema import ProductCreate, ProductResponse
from app.service.product_service import ProductService

router = APIRouter(prefix="/admin/products", tags=["Admin - Products"])


@router.get("/", response_model=List[ProductResponse])
def list_products(skip: int = Query(0, ge=0), limit: int = Query(10, le=100), db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.get_products(skip, limit)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    service = ProductService(db)
    product = service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductResponse)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    service = ProductService(db)
    return service.create_product(product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db)):
    service = ProductService(db)
    updated = service.update_product(product_id, product)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    service = ProductService(db)
    deleted = service.delete_product(product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}
