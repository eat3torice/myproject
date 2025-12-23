from typing import Optional

from sqlalchemy.orm import Session

from app.model.product_model import Product
from app.schema.product_schema import ProductCreate
import logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

class ProductService:
    def __init__(self, db: Session):
        self.db = db

    # ✅ Lấy danh sách sản phẩm (có phân trang và bộ lọc)
    def get_products(self, skip: int = 0, limit: int = 10, name: Optional[str] = None,
                    category_id: Optional[int] = None, brand_id: Optional[int] = None):
        query = self.db.query(Product)

        # Apply filters
        if name:
            query = query.filter(Product.Name.ilike(f"%{name}%"))
        if category_id:
            query = query.filter(Product.CategoryID == category_id)
        if brand_id:
            query = query.filter(Product.BrandID == brand_id)
        for idx, p in enumerate(query.all(), 1):
            logger.info(f"[{idx}] ID:{p.PK_Product} {p.Name}")
        return query.offset(skip).limit(limit).all()

    # ✅ Lấy chi tiết sản phẩm
    def get_product_by_id(self, product_id: int):
        return self.db.query(Product).filter(Product.PK_Product == product_id).first()

    # ✅ Tạo mới sản phẩm
    def create_product(self, product_data: ProductCreate):
        db_product = Product(
            Name=product_data.Name,
            Images=product_data.Images,
            CategoryID=product_data.CategoryID,  # ✅ đúng
            BrandID=product_data.BrandID,
        )
        self.db.add(db_product)
        self.db.commit()
        self.db.refresh(db_product)
        return db_product

    # ✅ Cập nhật sản phẩm
    def update_product(self, product_id: int, product_data: ProductCreate):
        product = self.db.query(Product).filter(Product.PK_Product == product_id).first()
        if not product:
            return None

        for key, value in product_data.dict(exclude_unset=True).items():
            setattr(product, key, value)
        self.db.commit()
        self.db.refresh(product)
        return product

    # ✅ Xóa sản phẩm
    def delete_product(self, product_id: int):
        product = self.db.query(Product).filter(Product.PK_Product == product_id).first()
        if not product:
            return None

        self.db.delete(product)
        self.db.commit()
        return product
