import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base_class import Base
from app.model.images_model import Images
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


def test_create_images(session):
    prod = Product(Name="Prod2")
    var = Variation(SKU="SKU4", Name="Var4", Price=10, Quantity=1)
    session.add_all([prod, var])
    session.commit()
    img = Images(ProductID=prod.PK_Product, VariationID=var.PK_Variation, Id_Image="img1.jpg", Set_Default=True)
    session.add(img)
    session.commit()
    result = session.query(Images).filter_by(Id_Image="img1.jpg").first()
    assert result is not None
    assert result.ProductID == prod.PK_Product
    assert result.VariationID == var.PK_Variation
