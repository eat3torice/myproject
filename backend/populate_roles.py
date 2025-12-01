#!/usr/bin/env python3
"""
Script to populate sample roles in the database
"""

from sqlalchemy.orm import sessionmaker

from app.database.session import engine
from app.model.role_model import Role


def populate_roles():
    """Populate basic roles"""
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Define basic roles
        roles = [
            {"Name": "ADMIN"},
            {"Name": "EMPLOYEE"},
            {"Name": "CUSTOMER"},
        ]

        print("Creating basic roles...")
        for role_data in roles:
            # Check if role already exists
            existing = session.query(Role).filter_by(Name=role_data["Name"]).first()
            if not existing:
                role = Role(**role_data)
                session.add(role)
                print(f"✓ Created role: {role_data['Name']}")
            else:
                print(f"⚠ Role already exists: {role_data['Name']}")

        session.commit()
        print("\n✅ Roles populated successfully!")

        # Show created roles
        print("\n📊 Current Roles:")
        roles_in_db = session.query(Role).all()
        for role in roles_in_db:
            print(f"  ID: {role.PK_Role}, Name: {role.Name}")

    except Exception as e:
        session.rollback()
        print(f"❌ Error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    populate_roles()
