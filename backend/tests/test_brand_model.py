import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base_class import Base
import app.model  # Import all models to ensure they're registered with SQLAlchemy
from app.model.brand_model import Brand


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


def test_create_brand(session):
    brand = Brand(Name="BrandX", Status="ACTIVE")
    session.add(brand)
    session.commit()
    result = session.query(Brand).filter_by(Name="BrandX").first()
    assert result is not None
    assert result.Name == "BrandX"
    assert result.Status == "ACTIVE"

