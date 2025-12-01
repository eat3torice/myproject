import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base_class import Base
from app.model.orderline_model import OrderLine
from app.model.posorder_model import POSOrder
from app.model.variation_model import Variation


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


def test_create_orderline(session):
    order = POSOrder()
    var = Variation(SKU="SKU2", Name="Var2", Price=200, Quantity=2)
    session.add_all([order, var])
    session.commit()
    ol = OrderLine(OrderID=order.PK_POSOrder, VariationID=var.PK_Variation, Quantity=2, Unit_Price=200, Price=400)
    session.add(ol)
    session.commit()
    result = session.query(OrderLine).filter_by(Quantity=2).first()
    assert result is not None
    assert result.variation.SKU == "SKU2"
    assert result.OrderID == order.PK_POSOrder

