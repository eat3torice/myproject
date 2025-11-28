import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base_class import Base
import app.model  # Import all models to ensure they're registered with SQLAlchemy
from app.model.cartitem_model import CartItem
from app.model.customer_model import Customer


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


def test_create_cartitem(session):
    cust = Customer(Name="Cust2")
    session.add(cust)
    session.commit()
    cart = CartItem(Customer_id=cust.PK_Customer, Quantity=2, Status="ACTIVE")
    session.add(cart)
    session.commit()
    result = session.query(CartItem).filter_by(Quantity=2).first()
    assert result is not None
    assert result.Customer_id == cust.PK_Customer

