#!/usr/bin/env python3
"""
Script to create sample variations for testing
"""

from datetime import datetime

from sqlalchemy.orm import sessionmaker

from app.database.session import engine
from app.model.variation_model import Variation
from app.model.product_model import Product


def create_sample_variations():
    """Create sample variations for products"""
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Get some products to add variations to
        products = session.query(Product).limit(5).all()
        
        if not products:
            print("⚠️ No products found. Please run populate_sample_data.py first!")
            return

        print("Creating sample variations...")
        created_count = 0

        # Sample variation data for each product
        variations_data = [
            # Size variations
            {"size": "S", "color": "Red", "stock": 50, "price_adjustment": 0},
            {"size": "M", "color": "Red", "stock": 75, "price_adjustment": 0},
            {"size": "L", "color": "Red", "stock": 60, "price_adjustment": 5000},
            {"size": "XL", "color": "Red", "stock": 40, "price_adjustment": 10000},
            
            # Color variations
            {"size": "M", "color": "Blue", "stock": 80, "price_adjustment": 0},
            {"size": "M", "color": "Black", "stock": 90, "price_adjustment": 0},
            {"size": "M", "color": "White", "stock": 70, "price_adjustment": 0},
            
            # Mixed variations
            {"size": "L", "color": "Blue", "stock": 55, "price_adjustment": 5000},
            {"size": "L", "color": "Black", "stock": 65, "price_adjustment": 5000},
            {"size": "XL", "color": "Blue", "stock": 45, "price_adjustment": 10000},
        ]

        for product in products:
            print(f"\n📦 Adding variations for product: {product.Name}")
            
            # Add 3-5 variations per product
            import random
            num_variations = random.randint(3, 5)
            selected_variations = random.sample(variations_data, num_variations)
            
            for var_data in selected_variations:
                # Check if variation already exists
                existing = session.query(Variation).filter(
                    Variation.ProductID == product.PK_Product,
                    Variation.Size == var_data["size"],
                    Variation.Color == var_data["color"]
                ).first()
                
                if existing:
                    print(f"  ⚠️ Variation {var_data['size']}/{var_data['color']} already exists")
                    continue

                try:
                    # Create variation
                    variation = Variation(
                        ProductID=product.PK_Product,
                        SKU=f"{product.Name[:10]}-{var_data['size']}-{var_data['color']}".replace(" ", "-"),
                        Name=f"{product.Name} - {var_data['size']}/{var_data['color']}",
                        Size=var_data["size"],
                        Color=var_data["color"],
                        Quantity=var_data["stock"],
                        Price=1000000 + var_data["price_adjustment"],  # Base price
                        Status="available",
                        Sold=0
                    )
                    session.add(variation)
                    session.commit()
                    session.refresh(variation)

                    print(f"  ✅ Created variation: {var_data['size']}/{var_data['color']} - Stock: {var_data['stock']}")
                    created_count += 1

                except Exception as e:
                    session.rollback()
                    print(f"  ❌ Error creating variation: {e}")

        print(f"\n🎉 Successfully created {created_count} sample variations!")

        # Show summary
        print("\n📊 Variation Summary:")
        for product in products:
            count = session.query(Variation).filter(Variation.ProductID == product.PK_Product).count()
            print(f"  {product.Name}: {count} variations")

    except Exception as e:
        session.rollback()
        print(f"❌ Error: {e}")
    finally:
        session.close()


if __name__ == "__main__":
    create_sample_variations()
