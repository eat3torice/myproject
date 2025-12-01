#!/usr/bin/env python3
"""
Script to create sample employee records for testing
"""

from datetime import datetime

from sqlalchemy.orm import sessionmaker

from app.database.session import engine
from app.model.account_model import Account
from app.model.employee_model import Employee


def create_sample_employees():
    """Create sample employee records linked to employee accounts"""
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Sample employee data linked to employee accounts
        sample_employees = [
            {
                "account_username": "employee1",
                "name": "Tran Thi B",
                "phone": "0902345678",
                "email": "b.tran@example.com"
            },
            {
                "account_username": "employee2",
                "name": "Le Van C",
                "phone": "0903456789",
                "email": "c.le@example.com"
            },
            {
                "account_username": "staff1",
                "name": "Pham Thi D",
                "phone": "0904567890",
                "email": "d.pham@example.com"
            },
            {
                "account_username": "admin",
                "name": "Nguyen Van Admin",
                "phone": "0905678901",
                "email": "admin@example.com"
            },
            {
                "account_username": "testuser123",
                "name": "Test User",
                "phone": "0906789012",
                "email": "test@example.com"
            }
        ]

        print("Creating sample employee records...")
        created_count = 0

        for emp_data in sample_employees:
            # Find the account
            account = session.query(Account).filter(Account.Username == emp_data["account_username"]).first()
            if not account:
                print(f"⚠ Account {emp_data['account_username']} not found, skipping...")
                continue

            # Check if employee record already exists
            existing = session.query(Employee).filter(Employee.AccountID == account.PK_Account).first()
            if existing:
                print(f"⚠ Employee record for {emp_data['account_username']} already exists, skipping...")
                continue

            try:
                # Create employee record
                db_employee = Employee(
                    AccountID=account.PK_Account,
                    Name=emp_data["name"],
                    Phone=emp_data["phone"],
                    Email=emp_data["email"],
                    Status="ACTIVE",
                    Creation_date=datetime.now()
                )
                session.add(db_employee)
                session.commit()
                session.refresh(db_employee)

                print(f"✅ Created employee: {emp_data['name']} (Account: {emp_data['account_username']})")
                created_count += 1

            except Exception as e:
                session.rollback()
                print(f"❌ Error creating employee for {emp_data['account_username']}: {e}")

        print(f"\n🎉 Successfully created {created_count} sample employee records!")

        # Show all employees
        print("\n👥 All Employee Records:")
        employees = session.query(Employee, Account.Username).join(Account, Employee.AccountID == Account.PK_Account).all()
        for employee, username in employees:
            print(f"  ID: {employee.PK_Employee}, Account: {username}, Name: {employee.Name}, Phone: {employee.Phone}, Email: {employee.Email}, Status: {employee.Status}")

    except Exception as e:
        session.rollback()
        print(f"❌ Error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    create_sample_employees()
