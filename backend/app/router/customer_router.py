from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schema.customer_schema import CustomerCreate, CustomerResponse, CustomerUpdate
from app.service.customer_service import CustomerService

router = APIRouter(prefix="/admin/customers", tags=["Admin - Customers"])


@router.get("/", response_model=List[CustomerResponse])
def list_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    name: str = Query(None, description="Lọc theo tên khách hàng (không phân biệt hoa thường)"),
    phone: str = Query(None, description="Lọc theo số điện thoại"),
    status: str = Query(None, description="Lọc theo trạng thái (ACTIVE/INACTIVE)"),
    db: Session = Depends(get_db)
):
    """Lấy danh sách tất cả khách hàng với khả năng lọc và phân trang"""
    service = CustomerService(db)
    return service.get_customers(skip, limit, name, phone, status)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """Lấy chi tiết một khách hàng"""
    service = CustomerService(db)
    customer = service.get_customer_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/", response_model=CustomerResponse)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    """Tạo khách hàng mới"""
    service = CustomerService(db)
    return service.create_customer(customer)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db)):
    """Cập nhật khách hàng"""
    service = CustomerService(db)
    updated = service.update_customer(customer_id, customer)
    if not updated:
        raise HTTPException(status_code=404, detail="Customer not found")
    return updated



# Deactivate customer (set status to Inactive)
@router.put("/{customer_id}/deactivate")
def deactivate_customer(customer_id: int, db: Session = Depends(get_db)):
    service = CustomerService(db)
    updated = service.deactivate_customer(customer_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {"message": "Customer deactivated successfully"}
