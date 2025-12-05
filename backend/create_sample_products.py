#!/usr/bin/env python3
"""
Script to create sample products
"""


from sqlalchemy.orm import sessionmaker

from app.database.session import engine
from app.model.brand_model import Brand
from app.model.category_model import Category
from app.model.product_model import Product


def create_sample_products():
    """Create sample products"""
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Get categories and brands
        categories = session.query(Category).all()
        brands = session.query(Brand).all()

        if not categories or not brands:
            print("⚠️ Please run populate_sample_data.py first to create categories and brands!")
            return

        # Sample products data
        products_data = [
            {"name": "iPhone 15 Pro", "description": "Latest Apple smartphone", "price": 29990000, "category": "Electronics", "brand": "Apple"},
            {"name": "Samsung Galaxy S24", "description": "Flagship Samsung phone", "price": 25990000, "category": "Electronics", "brand": "Samsung"},
            {"name": "Sony WH-1000XM5", "description": "Premium noise canceling headphones", "price": 8990000, "category": "Electronics", "brand": "Sony"},
            {"name": "Nike Air Max 90", "description": "Classic running shoes", "price": 3290000, "category": "Sports", "brand": "Nike"},
            {"name": "Adidas Ultraboost", "description": "High performance running shoes", "price": 4590000, "category": "Sports", "brand": "Adidas"},
            {"name": "Nike Dri-FIT T-Shirt", "description": "Breathable sports t-shirt", "price": 590000, "category": "Clothing", "brand": "Nike"},
            {"name": "Adidas Track Pants", "description": "Comfortable track pants", "price": 890000, "category": "Clothing", "brand": "Adidas"},
            {"name": "Programming Book Collection", "description": "Essential books for developers", "price": 499000, "category": "Books", "brand": "Sony"},
        ]

        print("Creating sample products...")
        created_count = 0

        for prod_data in products_data:
            # Find category and brand
            category = session.query(Category).filter(Category.Name == prod_data["category"]).first()
            brand = session.query(Brand).filter(Brand.Name == prod_data["brand"]).first()

            if not category or not brand:
                print(f"  ⚠️ Category or brand not found for {prod_data['name']}")
                continue

            # Check if product already exists
            existing = session.query(Product).filter(Product.Name == prod_data["name"]).first()
            if existing:
                print(f"  ⚠️ Product {prod_data['name']} already exists")
                continue

            try:
                # Create product
                product = Product(
                    Name=prod_data["name"],
                    CategoryID=category.PK_Category,
                    BrandID=brand.PK_Brand,
                    Images=""  # Empty images for now
                )
                session.add(product)
                session.commit()
                session.refresh(product)

                print(f"  ✅ Created product: {prod_data['name']}")
                created_count += 1

            except Exception as e:
                session.rollback()
                print(f"  ❌ Error creating {prod_data['name']}: {e}")

        print(f"\n🎉 Successfully created {created_count} sample products!")

        # Show summary
        print("\n📊 Product Summary by Category:")
        for category in categories:
            count = session.query(Product).filter(Product.CategoryID == category.PK_Category).count()
            if count > 0:
                print(f"  {category.Name}: {count} products")

    except Exception as e:
        session.rollback()
        print(f"❌ Error: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    create_sample_products()
