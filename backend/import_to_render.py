#!/usr/bin/env python3
"""
Script to import data to Render PostgreSQL database
"""
import os
import sys

# Load .env.render instead of .env
os.environ.clear()
from dotenv import load_dotenv

load_dotenv('.env.render')

# Now import the scripts
sys.path.insert(0, os.path.dirname(__file__))

from create_sample_accounts import create_sample_accounts
from create_sample_employees import create_sample_employees
from populate_roles import populate_roles
from populate_sample_data import populate_sample_data


def main():
    """Import all data to Render database"""
    print("=" * 60)
    print("IMPORTING DATA TO RENDER POSTGRESQL DATABASE")
    print("=" * 60)

    print("\n1️⃣ Populating roles...")
    try:
        populate_roles()
    except Exception as e:
        print(f"⚠️ Roles may already exist: {e}")

    print("\n2️⃣ Creating sample accounts...")
    try:
        create_sample_accounts()
    except Exception as e:
        print(f"❌ Error creating accounts: {e}")

    print("\n3️⃣ Creating sample employees...")
    try:
        create_sample_employees()
    except Exception as e:
        print(f"❌ Error creating employees: {e}")

    print("\n4️⃣ Populating sample data (categories, brands, products)...")
    try:
        populate_sample_data()
    except Exception as e:
        print(f"❌ Error populating sample data: {e}")

    print("\n" + "=" * 60)
    print("✅ DATA IMPORT COMPLETED!")
    print("=" * 60)

if __name__ == "__main__":
    main()
