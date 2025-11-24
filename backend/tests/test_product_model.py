import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base_class import Base
from app.model.brand_model import Brand
from app.model.category_model import Category
from app.model.product_model import Product


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


def test_create_product(session):
    cat = Category(Name="TestCat", Status="ACTIVE")
    brand = Brand(Name="TestBrand", Status="ACTIVE")
    session.add_all([cat, brand])
    session.commit()
    prod = Product(Name="TestProduct", CategoryID=cat.PK_Category, BrandID=brand.PK_Brand)
    session.add(prod)
    session.commit()
    result = session.query(Product).filter_by(Name="TestProduct").first()
    assert result is not None
    assert result.Name == "TestProduct"
    assert result.category.Name == "TestCat"
    assert result.brand.Name == "TestBrand"
