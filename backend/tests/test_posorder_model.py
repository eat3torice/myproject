import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base_class import Base
from app.model.customer_model import Customer
from app.model.employee_model import Employee
from app.model.posorder_model import POSOrder


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


def test_create_posorder(session):
    cust = Customer(Name="Cust1")
    emp = Employee(Name="Emp1")
    session.add_all([cust, emp])
    session.commit()
    order = POSOrder(CustomerID=cust.PK_Customer, EmployeeID=emp.PK_Employee, Total_Amount=1000, Status="NEW")
    session.add(order)
    session.commit()
    result = session.query(POSOrder).filter_by(Status="NEW").first()
    assert result is not None
    assert result.CustomerID == cust.PK_Customer
    assert result.EmployeeID == emp.PK_Employee
