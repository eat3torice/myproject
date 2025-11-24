import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base_class import Base
from app.model.account_model import Account
from app.model.customer_model import Customer


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


def test_create_customer(session):
    acc = Account(Username="user1", Password="pw", RoleID=1)
    session.add(acc)
    session.commit()
    cust = Customer(AccountID=acc.PK_Account, Name="Test User", Status="ACTIVE")
    session.add(cust)
    session.commit()
    result = session.query(Customer).filter_by(Name="Test User").first()
    assert result is not None
    assert result.Name == "Test User"
    assert result.account.Username == "user1"
