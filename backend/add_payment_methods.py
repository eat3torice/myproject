"""
Script to insert initial payment methods into the database
"""

from app.database.session import SessionLocal
from app.model.paymentmethod_model import PaymentMethod


def add_payment_methods():
    db = SessionLocal()
    try:
        # Check if payment methods already exist
        existing_count = db.query(PaymentMethod).count()
        if existing_count > 0:
            print(f"Payment methods already exist ({existing_count} methods)")
            # Show existing methods
            methods = db.query(PaymentMethod).all()
            for m in methods:
                print(f"  - ID: {m.PK_PaymentMethod}, Type: {m.Type}, Status: {m.Status}")
            return

        # Add payment methods with specific IDs to match frontend expectations
        methods = [
            PaymentMethod(Type="Credit Card", Note="Credit card payment", Status="ACTIVE"),
            PaymentMethod(Type="Debit Card", Note="Debit card payment", Status="ACTIVE"),
            PaymentMethod(Type="Bank Transfer", Note="Bank transfer", Status="ACTIVE"),
            PaymentMethod(Type="E-Wallet", Note="Digital wallet payment", Status="ACTIVE"),
            PaymentMethod(Type="Cash", Note="Cash payment", Status="ACTIVE"),  # ID 5
        ]

        db.add_all(methods)
        db.commit()

        # Refresh to get IDs
        for m in methods:
            db.refresh(m)

        print("✅ Payment methods added successfully:")
        for m in methods:
            print(f"  - ID: {m.PK_PaymentMethod}, Type: {m.Type}")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    add_payment_methods()
