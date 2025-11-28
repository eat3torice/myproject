import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base_class import Base
import app.model  # Import all models to ensure they're registered with SQLAlchemy
from app.model.account_model import Account
from app.model.employee_model import Employee


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


def test_create_employee(session):
    acc = Account(Username="emp1", Password="pw", RoleID=1)
    session.add(acc)
    session.commit()
    emp = Employee(AccountID=acc.PK_Account, Name="Emp Name")
    session.add(emp)
    session.commit()
    result = session.query(Employee).filter_by(Name="Emp Name").first()
    assert result is not None
    assert result.Name == "Emp Name"
    assert result.account.Username == "emp1"

