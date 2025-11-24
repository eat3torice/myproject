import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base_class import Base
from app.model.category_model import Category


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    sess = Session()
    yield sess
    sess.close()


def test_create_category(session):
    cat = Category(Name="Furniture", Status="ACTIVE")
    session.add(cat)
    session.commit()
    result = session.query(Category).filter_by(Name="Furniture").first()
    assert result is not None
    assert result.Name == "Furniture"
    assert result.Status == "ACTIVE"
