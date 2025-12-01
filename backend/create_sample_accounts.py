#!/usr/bin/env python3
"""
Script to create sample accounts for testing role-based access control
"""

from sqlalchemy.orm import sessionmaker

from app.auth.auth_service import AuthService
from app.database.session import engine
from app.model.account_model import Account


def create_sample_accounts():
    """Create sample accounts for testing"""
    Session = sessionmaker(bind=engine)
    session = Session()

    auth_service = AuthService(session)

    try:
        # Sample accounts data
        sample_accounts = [
            # Admin accounts
            {"username": "admin", "password": "admin123", "role_id": 1, "phone": "0123456789"},
            {"username": "testuser123", "password": "test123", "role_id": 1, "phone": "0123456789"},
            {"username": "bca123", "password": "bca123", "role_id": 1, "phone": "0123456789"},
            {"username": "abc123", "password": "abc123", "role_id": 1, "phone": "0123456789"},

            # Employee accounts
            {"username": "employee1", "password": "emp123", "role_id": 18, "phone": "0123456789"},
            {"username": "employee2", "password": "emp456", "role_id": 18, "phone": "0123456789"},
            {"username": "staff1", "password": "staff123", "role_id": 18, "phone": "0123456789"},

            # Customer accounts
            {"username": "customer1", "password": "cust123", "role_id": 2, "phone": "0123456789"},
            {"username": "customer2", "password": "cust456", "role_id": 2, "phone": "0123456789"},
            {"username": "user1", "password": "user123", "role_id": 2, "phone": "0123456789"},
        ]

        print("Creating sample accounts...")
        created_count = 0

        for account_data in sample_accounts:
            existing = session.query(Account).filter(Account.Username == account_data["username"]).first()
            if existing:
                # Update password and status
                hashed_password = auth_service.hash_password(account_data["password"])
                existing.Password = hashed_password
                existing.Status = "ACTIVE"
                session.commit()
                print(f"✅ Updated {account_data['username']} (Role: {account_data['role_id']})")
                created_count += 1
                continue

            try:
                # Create account using auth service
                hashed_password = auth_service.hash_password(account_data["password"])
                db_account = Account(
                    Username=account_data["username"],
                    Password=hashed_password,
                    RoleID=account_data["role_id"],
                    Status="ACTIVE"
                )
                session.add(db_account)
                session.commit()
                session.refresh(db_account)

                print(f"✅ Created {account_data['username']} (Role: {account_data['role_id']})")
                created_count += 1

            except Exception as e:
                session.rollback()
                print(f"❌ Error creating {account_data['username']}: {e}")

        print(f"\n🎉 Successfully created {created_count} sample accounts!")

        # Show summary
        print("\n📊 Account Summary:")
        for role_name, role_id in [("ADMIN", 1), ("EMPLOYEE", 18), ("CUSTOMER", 2)]:
            count = session.query(Account).filter(Account.RoleID == role_id).count()
            print(f"  {role_name}: {count} accounts")

        # Show all accounts
        print("\n📋 All Sample Accounts:")
        accounts = session.query(Account) \
            .filter(Account.Username.in_([acc["username"] for acc in sample_accounts])) \
            .all()
        for account in accounts:
            role_name = {1: "ADMIN", 18: "EMPLOYEE", 2: "CUSTOMER"}.get(account.RoleID, "UNKNOWN")
            print(
                f"  {account.Username}: {role_name} "
                f"(RoleID: {account.RoleID})"
            )

    except Exception as e:
        session.rollback()
        print(f"❌ Error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    create_sample_accounts()
