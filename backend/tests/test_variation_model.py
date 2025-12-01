import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base_class import Base
from app.model.product_model import Product
from app.model.variation_model import Variation


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


def test_create_variation(session):
    prod = Product(Name="Prod1")
    session.add(prod)
    session.commit()
    var = Variation(ProductID=prod.PK_Product, SKU="SKU1", Name="Var1", Price=100, Quantity=5)
    session.add(var)
    session.commit()
    result = session.query(Variation).filter_by(SKU="SKU1").first()
    assert result is not None
    assert result.Name == "Var1"
    assert result.product.Name == "Prod1"

