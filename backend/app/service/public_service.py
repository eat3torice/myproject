from typing import Optional

from sqlalchemy.orm import Session
import logging

from app.model.brand_model import Brand
from app.model.category_model import Category
from app.model.product_model import Product
from app.model.variation_model import Variation

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class PublicProductService:
    def __init__(self, db: Session):
        self.db = db

    def get_variations(
        self,
        skip: int = 0,
        limit: int = 20,
        category_id: Optional[int] = None,
        brand_id: Optional[int] = None,
        search: Optional[str] = None,
    ):
        """Lấy danh sách biến thể sản phẩm (cho user xem)"""
        query = (
            self.db.query(Variation)
            .join(Product)
            .filter(
                Variation.Quantity > 0  # Chỉ hiện có hàng
            )
        )

        if category_id:
            query = query.filter(Product.CategoryID == category_id)
        if brand_id:
            query = query.filter(Product.BrandID == brand_id)
        if search:
            query = query.filter((Variation.Name.ilike(f"%{search}%")) | (Product.Name.ilike(f"%{search}%")))

        variations = query.offset(skip).limit(limit).all()

        # Log
        logger.info(f"🛍️  {len(variations)} variations (public)")
        for idx, v in enumerate(variations, 1):
            logger.info(f"[{idx}] ID:{v.PK_Variation} {v.Name} - {v.Price:,.0f}đ - Stock:{v.Quantity}")

        # Populate CategoryID from Product
        for variation in variations:
            if variation.product:
                variation.CategoryID = variation.product.CategoryID

        return variations

    def get_products(
        self,
        skip: int = 0,
        limit: int = 20,
        category_id: Optional[int] = None,
        brand_id: Optional[int] = None,
        search: Optional[str] = None,
    ):
        """Lấy danh sách sản phẩm công khai (chỉ hiện sản phẩm active)"""
        query = self.db.query(Product)

        if category_id:
            query = query.filter(Product.CategoryID == category_id)
        if brand_id:
            query = query.filter(Product.BrandID == brand_id)
        if search:
            query = query.filter(Product.Name.ilike(f"%{search}%"))

        return query.offset(skip).limit(limit).all()

    def get_product_detail(self, product_id: int):
        """Lấy chi tiết sản phẩm kèm variations"""
        return self.db.query(Product).filter(Product.PK_Product == product_id).first()

    def get_variation_detail(self, variation_id: int):
        """Lấy chi tiết một variation"""
        return self.db.query(Variation).filter(Variation.PK_Variation == variation_id).first()

    def get_categories(self):
        """Lấy danh sách danh mục"""
        return self.db.query(Category).all()

    def get_brands(self):
        """Lấy danh sách thương hiệu"""
        return self.db.query(Brand).all()

    def search_variations(self, keyword: str, skip: int = 0, limit: int = 20):
        """Tìm kiếm biến thể sản phẩm"""
        variations = (
            self.db.query(Variation)
            .join(Product)
            .filter(
                (Variation.Name.ilike(f"%{keyword}%")) | (Product.Name.ilike(f"%{keyword}%")), Variation.Quantity > 0
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

        # Populate CategoryID from Product
        for variation in variations:
            if variation.product:
                variation.CategoryID = variation.product.CategoryID

        return variations

    def get_featured_variations(self, limit: int = 10):
        """Lấy biến thể sản phẩm nổi bật (bán chạy)"""
        variations = (
            self.db.query(Variation).filter(Variation.Quantity > 0).order_by(Variation.Sold.desc()).limit(limit).all()
        )

        # Populate CategoryID from Product
        for variation in variations:
            if variation.product:
                variation.CategoryID = variation.product.CategoryID

        return variations
