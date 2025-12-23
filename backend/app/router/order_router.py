from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin_account
from app.database.session import get_db
from app.model.account_model import Account
from app.schema.order_schema import OrderCreate, OrderLineResponse, OrderResponse, OrderUpdate
from app.service.order_service import OrderService

router = APIRouter(prefix="/admin/orders", tags=["Admin - Orders"])


@router.get("/", response_model=List[OrderResponse])
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    status: Optional[str] = Query(None, description="Lọc theo trạng thái đơn hàng"),
    customer_id: Optional[int] = Query(None, description="Lọc theo ID khách hàng"),
    start_date: Optional[datetime] = Query(None, description="Lọc từ ngày (YYYY-MM-DD)"),
    end_date: Optional[datetime] = Query(None, description="Lọc đến ngày (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_admin: Account = Depends(get_current_admin_account)
):
    """Lấy danh sách tất cả đơn hàng với khả năng lọc và phân trang"""
    service = OrderService(db)
    return service.get_orders(skip, limit, status, customer_id, start_date, end_date)


@router.get("/statistics")
def get_order_statistics(
    start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)
):
    """Lấy thống kê đơn hàng"""
    service = OrderService(db)
    return service.get_order_statistics(start_date, end_date)


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Lấy chi tiết một đơn hàng"""
    service = OrderService(db)
    order = service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/{order_id}/lines", response_model=List[OrderLineResponse])
def get_order_lines(order_id: int, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Lấy danh sách sản phẩm trong đơn hàng"""
    service = OrderService(db)
    order = service.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return service.get_order_lines(order_id)


@router.post("/", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Tạo đơn hàng mới"""
    service = OrderService(db)
    try:
        return service.create_order(order)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{order_id}", response_model=OrderResponse)
def update_order(order_id: int, order: OrderUpdate, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Cập nhật đơn hàng"""
    service = OrderService(db)
    try:
        updated = service.update_order(order_id, order)
        if not updated:
            raise HTTPException(status_code=404, detail="Order not found")
        return updated
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(order_id: int, db: Session = Depends(get_db), current_admin: Account = Depends(get_current_admin_account)):
    """Hủy đơn hàng và hoàn lại số lượng tồn kho"""
    service = OrderService(db)
    cancelled = service.cancel_order(order_id)
    if not cancelled:
        raise HTTPException(status_code=404, detail="Order not found or already cancelled")
    return cancelled
