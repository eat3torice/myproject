from datetime import datetime

from sqlalchemy.orm import Session

from app.model.employee_model import Employee
from app.schema.employee_schema import EmployeeCreate, EmployeeUpdate


class EmployeeService:
    def __init__(self, db: Session):
        self.db = db

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.model.account_model import Account
from app.model.employee_model import Employee
from app.schema.employee_schema import EmployeeCreate, EmployeeUpdate


class EmployeeService:
    def __init__(self, db: Session):
        self.db = db

    def get_employees(self, skip: int = 0, limit: int = 100, name: Optional[str] = None, phone: Optional[str] = None, email: Optional[str] = None, status: Optional[str] = None):
        query = self.db.query(Employee, Account.Status.label('account_status')).join(Account, Employee.AccountID == Account.PK_Account)

        # Apply filters
        if name:
            query = query.filter(Employee.Name.ilike(f"%{name}%"))
        if phone:
            query = query.filter(Employee.Phone.ilike(f"%{phone}%"))
        if email:
            query = query.filter(Employee.Email.ilike(f"%{email}%"))
        if status:
            query = query.filter(Account.Status.ilike(f"%{status}%"))

        results = query.offset(skip).limit(limit).all()

        # Convert to employee objects with account status
        employees = []
        for employee, account_status in results:
            employee_dict = {
                'PK_Employee': employee.PK_Employee,
                'AccountID': employee.AccountID,
                'Name': employee.Name,
                'Phone': employee.Phone,
                'Email': employee.Email,
                'Status': account_status,
                'Creation_date': employee.Creation_date,
                'Edit_date': employee.Edit_date
            }
            employees.append(employee_dict)

        return employees

    def get_employee_by_id(self, employee_id: int):
        result = self.db.query(Employee, Account.Status.label('account_status')).join(Account, Employee.AccountID == Account.PK_Account).filter(Employee.PK_Employee == employee_id).first()

        if not result:
            return None

        employee, account_status = result
        employee_dict = {
            'PK_Employee': employee.PK_Employee,
            'AccountID': employee.AccountID,
            'Name': employee.Name,
            'Phone': employee.Phone,
            'Email': employee.Email,
            'Status': account_status,
            'Creation_date': employee.Creation_date,
            'Edit_date': employee.Edit_date
        }
        return employee_dict

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

    def deactivate_employee(self, employee_id: int):
        employee = self.db.query(Employee).filter(Employee.PK_Employee == employee_id).first()
        if not employee:
            return None

        # Deactivate the associated account instead of the employee
        account = self.db.query(Account).filter(Account.PK_Account == employee.AccountID).first()
        if not account:
            return None

        account.Status = "INACTIVE"
        employee.Edit_date = datetime.now()
        self.db.commit()
        self.db.refresh(employee)
        return employee

    def reactivate_employee(self, employee_id: int):
        employee = self.db.query(Employee).filter(Employee.PK_Employee == employee_id).first()
        if not employee:
            return None

        # Reactivate the associated account
        account = self.db.query(Account).filter(Account.PK_Account == employee.AccountID).first()
        if not account:
            return None

        account.Status = "ACTIVE"
        employee.Edit_date = datetime.now()
        self.db.commit()
        self.db.refresh(employee)
        return employee
