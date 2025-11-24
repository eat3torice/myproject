import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base_class import Base
from app.model.cart_variation_model import CartVariation
from app.model.cartitem_model import CartItem
from app.model.customer_model import Customer
from app.model.variation_model import Variation


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


def test_create_cart_variation(session):
    cust = Customer(Name="Cust3")
    session.add(cust)
    session.commit()
    cart = CartItem(Customer_id=cust.PK_Customer, Quantity=1)
    var = Variation(SKU="SKU3", Name="Var3", Price=50, Quantity=1)
    session.add_all([cart, var])
    session.commit()
    cart_var = CartVariation(CartItemID=cart.PK_CartItem, VariationID=var.PK_Variation)
    session.add(cart_var)
    session.commit()
    result = session.query(CartVariation).filter_by(CartItemID=cart.PK_CartItem).first()
    assert result is not None
    assert result.VariationID == var.PK_Variation
