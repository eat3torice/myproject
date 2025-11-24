import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base_class import Base
from app.model.paymentmethod_model import PaymentMethod


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


def test_create_paymentmethod(session):
    pm = PaymentMethod(Type="Cash", Status="ACTIVE")
    session.add(pm)
    session.commit()
    result = session.query(PaymentMethod).filter_by(Type="Cash").first()
    assert result is not None
    assert result.Type == "Cash"
    assert result.Status == "ACTIVE"
