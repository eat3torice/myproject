# from typing import Optional

# from sqlalchemy.orm import Session

# from app.model.category_model import Category
# from app.schema.category_schema import CategoryCreate, CategoryUpdate
# import logging
# logger = logging.getLogger(__name__)
# logger.setLevel(logging.DEBUG)

# class CategoryServiceLearn:
#     def __init__(self, db: Session):
#         self.db = db

#     def getCategory(self,
#                     skip : int = 0,
#                     Limit : int = 100,
#                     name : Optional[str] = None,
#                     status : Optional[str] =None):
#         query = self.db.query(Category)
#         # Apply filters
#         if name:
#             query = query.filter(Category.Name.ilike(f"%{name}%"))
#         if status:
#             query = query.filter(Category.Status == status)
#         logger.info(f"Fetching categories with skip={skip}, limit={Limit}, name={name}, status={status}")
#         return query.offset(skip).limit(Limit).all()
    
#     def getCategoryByID(self, category_id: int):
#         category = self.db.query(Category).filter(Category.PK_Category == category_id).first()
#         if category:
#             logger.info(f"Category found: ID={category.PK_Category}, Name={category.Name}")
#         else:
#             logger.warning(f"Category with ID={category_id} not found")
#         return category
    
#     def createCategory(self, category_data: CategoryCreate):
#         newCateogory = Category(Name=category_data.Name, Status=category_data.Status)
#         self.db.add(newCateogory)
#         self.db.commit()
#         self.db.refresh(newCateogory)
#         logger.info(f"Created new category: ID={newCateogory.PK_Category}, Name={newCateogory.Name}")
#         return newCateogory
    
#     def updateCategory(self, category_id: int, category_data: CategoryUpdate):
#         categoryUpdate = self.db.query(Category).filter(Category.PK_Category == category_id).first() 
#         if not categoryUpdate:
#             logger.warning(f"Category with ID={category_id} not found for update")
#             return None
#         for key, value in category_data.dict(exclude_unset=True).items():
#             setattr(categoryUpdate, key, value)
#         self.db.commit()
#         self.db.refresh(categoryUpdate)
#         logger.info(f"Updated category: ID={categoryUpdate.PK_Category}, Name={categoryUpdate.Name}")
#         return categoryUpdate
    
#     def deleteCategory(self, category_id: int):
#         categoryDelete = self.db.query(Category).filter(Category.PK_Category == category_id).first()
#         if not categoryDelete:
#             logger.warning(f"Category with ID={category_id} not found for deletion")
#             return None
#         self.db.delete(categoryDelete)
#         self.db.commit()
#         logger.info(f"Deleted category: ID={categoryDelete.PK_Category}, Name={categoryDelete.Name}")
#         return categoryDelete 