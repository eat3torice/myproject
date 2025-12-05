#!/usr/bin/env python3
"""
Script to create Customer profiles for existing customer accounts
"""

from sqlalchemy.orm import sessionmaker

from app.database.session import engine
from app.model.account_model import Account
from app.model.customer_model import Customer


def create_customer_profiles():
    """Create customer profiles for accounts with role_id = 3"""
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Get customer accounts by username pattern (customer*, user*)
        customer_accounts = session.query(Account).filter(
            (Account.Username.like('customer%')) | (Account.Username.like('user%'))
        ).all()

        print(f"Found {len(customer_accounts)} customer accounts (by username pattern)")
        created_count = 0
        updated_count = 0

        for account in customer_accounts:
            # Check if customer profile already exists
            existing_customer = session.query(Customer).filter(Customer.AccountID == account.PK_Account).first()

            if existing_customer:
                print(f"✅ Customer profile already exists for {account.Username}")
                updated_count += 1
                continue

            # Create customer profile
            customer = Customer(
                AccountID=account.PK_Account,
                Name=account.Username.capitalize(),  # Use username as default name
                Phone="0123456789",  # Default phone
                Address="Default Address",  # Default address
                Status="ACTIVE"
            )
            session.add(customer)
            session.commit()
            session.refresh(customer)

            print(f"✅ Created customer profile for {account.Username} (Customer ID: {customer.PK_Customer})")
            created_count += 1

        print("\n🎉 Summary:")
        print(f"  Created: {created_count} new customer profiles")
        print(f"  Existing: {updated_count} customer profiles")
        print(f"  Total: {created_count + updated_count} customer accounts")

    except Exception as e:
        session.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()


if __name__ == "__main__":
    create_customer_profiles()
