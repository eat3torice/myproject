#!/usr/bin/env python3
"""
Script to populate sample data for categories and brands
"""

from sqlalchemy.orm import sessionmaker

from app.database.session import engine
from app.model.brand_model import Brand
from app.model.category_model import Category


def populate_sample_data():
    """Populate sample categories and brands"""
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Create sample categories
        categories = [
            {"Name": "Electronics", "Status": "active"},
            {"Name": "Clothing", "Status": "active"},
            {"Name": "Books", "Status": "active"},
            {"Name": "Home & Garden", "Status": "active"},
            {"Name": "Sports", "Status": "active"},
        ]

        print("Creating sample categories...")
        for cat_data in categories:
            # Check if category already exists
            existing = session.query(Category).filter_by(Name=cat_data["Name"]).first()
            if not existing:
                category = Category(**cat_data)
                session.add(category)
                print(f"✓ Created category: {cat_data['Name']}")

        # Create sample brands
        brands = [
            {"Name": "Apple", "Status": "active"},
            {"Name": "Samsung", "Status": "active"},
            {"Name": "Nike", "Status": "active"},
            {"Name": "Adidas", "Status": "active"},
            {"Name": "Sony", "Status": "active"},
        ]

        print("\nCreating sample brands...")
        for brand_data in brands:
            # Check if brand already exists
            existing = session.query(Brand).filter_by(Name=brand_data["Name"]).first()
            if not existing:
                brand = Brand(**brand_data)
                session.add(brand)
                print(f"✓ Created brand: {brand_data['Name']}")

        session.commit()
        print("\n✅ Sample data populated successfully!")

        # Show created data
        print("\n📊 Current Categories:")
        cats = session.query(Category).all()
        for cat in cats:
            print(f"  ID: {cat.PK_Category}, Name: {cat.Name}")

        print("\n📊 Current Brands:")
        brs = session.query(Brand).all()
        for brand in brs:
            print(f"  ID: {brand.PK_Brand}, Name: {brand.Name}")

    except Exception as e:
        session.rollback()
        print(f"❌ Error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    populate_sample_data()
