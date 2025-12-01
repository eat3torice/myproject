from typing import Optional

from sqlalchemy.orm import Session

from app.model.category_model import Category
from app.schema.category_schema import CategoryCreate, CategoryUpdate


class CategoryService:
    def __init__(self, db: Session):
        self.db = db

    def get_categories(self, skip: int = 0, limit: int = 100, name: Optional[str] = None, status: Optional[str] = None):
        query = self.db.query(Category)

        # Apply filters
        if name:
            query = query.filter(Category.Name.ilike(f"%{name}%"))
        if status:
            query = query.filter(Category.Status == status)

        return query.offset(skip).limit(limit).all()

    def get_category_by_id(self, category_id: int):
        return self.db.query(Category).filter(Category.PK_Category == category_id).first()

    def create_category(self, category_data: CategoryCreate):
        db_category = Category(Name=category_data.Name, Status=category_data.Status)
        self.db.add(db_category)
        self.db.commit()
        self.db.refresh(db_category)
        return db_category

    def update_category(self, category_id: int, category_data: CategoryUpdate):
        category = self.db.query(Category).filter(Category.PK_Category == category_id).first()
        if not category:
            return None

        for key, value in category_data.dict(exclude_unset=True).items():
            setattr(category, key, value)

        self.db.commit()
        self.db.refresh(category)
        return category

    def delete_category(self, category_id: int):
        category = self.db.query(Category).filter(Category.PK_Category == category_id).first()
        if not category:
            return None

        self.db.delete(category)
        self.db.commit()
        return category
