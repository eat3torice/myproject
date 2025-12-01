from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin_account
from app.database.session import get_db
from app.model.account_model import Account
from app.schema.employee_schema import EmployeeCreate, EmployeeResponse, EmployeeUpdate
from app.service.employee_service import EmployeeService

router = APIRouter(prefix="/admin/employees", tags=["Admin - Employees"])


@router.get("/", response_model=List[EmployeeResponse])
def list_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    name: str = Query(None, description="Lọc theo tên nhân viên (không phân biệt hoa thường)"),
    phone: str = Query(None, description="Lọc theo số điện thoại"),
    email: str = Query(None, description="Lọc theo email"),
    status: str = Query(None, description="Lọc theo trạng thái tài khoản (ACTIVE/INACTIVE)"),
    db: Session = Depends(get_db),
    current_admin: Account = Depends(get_current_admin_account)
):
    """Lấy danh sách tất cả nhân viên với khả năng lọc và phân trang"""
    service = EmployeeService(db)
    return service.get_employees(skip, limit, name, phone, email, status)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_admin: Account = Depends(get_current_admin_account)
):
    """Lấy chi tiết một nhân viên"""
    service = EmployeeService(db)
    employee = service.get_employee_by_id(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.post("/", response_model=EmployeeResponse)
def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_admin: Account = Depends(get_current_admin_account)
):
    """Tạo nhân viên mới"""
    service = EmployeeService(db)
    return service.create_employee(employee)


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    employee: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_admin: Account = Depends(get_current_admin_account)
):
    """Cập nhật nhân viên"""
    service = EmployeeService(db)
    updated = service.update_employee(employee_id, employee)
    if not updated:
        raise HTTPException(status_code=404, detail="Employee not found")
    return updated


@router.put("/{employee_id}/deactivate")
def deactivate_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_admin: Account = Depends(get_current_admin_account)
):
    """Vô hiệu hóa tài khoản nhân viên"""
    service = EmployeeService(db)
    deactivated = service.deactivate_employee(employee_id)
    if not deactivated:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deactivated successfully"}


@router.put("/{employee_id}/reactivate")
def reactivate_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_admin: Account = Depends(get_current_admin_account)
):
    """Kích hoạt lại tài khoản nhân viên"""
    service = EmployeeService(db)
    reactivated = service.reactivate_employee(employee_id)
    if not reactivated:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee reactivated successfully"}
