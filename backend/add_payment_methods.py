"""
Script to insert initial payment methods into the database
"""

from app.database.session import SessionLocal
from app.model.paymentmethod_model import PaymentMethod


def add_payment_methods():
    db = SessionLocal()
    try:
        # Check if payment methods already exist
        existing = db.query(PaymentMethod).first()
        if existing:
            print("Payment methods already exist")
            return

        # Add payment methods
        methods = [
            PaymentMethod(Type="Cash", Note="Cash payment", Status="ACTIVE"),
            PaymentMethod(Type="Card", Note="Credit/Debit card payment", Status="ACTIVE"),
            PaymentMethod(Type="Transfer", Note="Bank transfer", Status="ACTIVE"),
        ]

        db.add_all(methods)
        db.commit()
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
