import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base_class import Base
from app.model.account_model import Account
from app.model.role_model import Role


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


def test_create_account(session):
    role = Role(Name="User")
    session.add(role)
    session.commit()
    acc = Account(Username="acc1", Password="pw", RoleID=role.PK_Role)
    session.add(acc)
    session.commit()
    result = session.query(Account).filter_by(Username="acc1").first()
    assert result is not None
    assert result.Username == "acc1"
    assert result.role.Name == "User"

