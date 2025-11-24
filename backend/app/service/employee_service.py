from datetime import datetime

from sqlalchemy.orm import Session

from app.model.employee_model import Employee
from app.schema.employee_schema import EmployeeCreate, EmployeeUpdate


class EmployeeService:
    def __init__(self, db: Session):
        self.db = db

    def get_employees(self, skip: int = 0, limit: int = 100):
        return self.db.query(Employee).offset(skip).limit(limit).all()

    def get_employee_by_id(self, employee_id: int):
        return self.db.query(Employee).filter(Employee.PK_Employee == employee_id).first()

    def get_employee_by_account_id(self, account_id: int):
        return self.db.query(Employee).filter(Employee.AccountID == account_id).first()

    def create_employee(self, employee_data: EmployeeCreate):
        db_employee = Employee(
            AccountID=employee_data.AccountID,
            Name=employee_data.Name,
            Phone=employee_data.Phone,
            Email=employee_data.Email,
            Creation_date=datetime.now(),
        )
        self.db.add(db_employee)
        self.db.commit()
        self.db.refresh(db_employee)
        return db_employee

    def update_employee(self, employee_id: int, employee_data: EmployeeUpdate):
        employee = self.db.query(Employee).filter(Employee.PK_Employee == employee_id).first()
        if not employee:
            return None

        for key, value in employee_data.dict(exclude_unset=True).items():
            setattr(employee, key, value)

        employee.Edit_date = datetime.now()
        self.db.commit()
        self.db.refresh(employee)
        return employee

    def delete_employee(self, employee_id: int):
        employee = self.db.query(Employee).filter(Employee.PK_Employee == employee_id).first()
        if not employee:
            return None

        self.db.delete(employee)
        self.db.commit()
        return employee
