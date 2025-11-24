from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schema.employee_schema import EmployeeCreate, EmployeeResponse, EmployeeUpdate
from app.service.employee_service import EmployeeService

router = APIRouter(prefix="/admin/employees", tags=["Admin - Employees"])


@router.get("/", response_model=List[EmployeeResponse])
def list_employees(skip: int = Query(0, ge=0), limit: int = Query(100, le=1000), db: Session = Depends(get_db)):
    """Lấy danh sách tất cả nhân viên"""
    service = EmployeeService(db)
    return service.get_employees(skip, limit)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    """Lấy chi tiết một nhân viên"""
    service = EmployeeService(db)
    employee = service.get_employee_by_id(employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.post("/", response_model=EmployeeResponse)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    """Tạo nhân viên mới"""
    service = EmployeeService(db)
    return service.create_employee(employee)


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: int, employee: EmployeeUpdate, db: Session = Depends(get_db)):
    """Cập nhật nhân viên"""
    service = EmployeeService(db)
    updated = service.update_employee(employee_id, employee)
    if not updated:
        raise HTTPException(status_code=404, detail="Employee not found")
    return updated


@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    """Xóa nhân viên"""
    service = EmployeeService(db)
    deleted = service.delete_employee(employee_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted successfully"}
