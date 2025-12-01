import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base_class import Base
from app.model.role_model import Role


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


def test_create_role(session):
    role = Role(Name="Admin")
    session.add(role)
    session.commit()
    result = session.query(Role).filter_by(Name="Admin").first()
    assert result is not None
    assert result.Name == "Admin"
    assert isinstance(result.PK_Role, int)

