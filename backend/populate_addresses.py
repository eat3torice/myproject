#!/usr/bin/env python3
"""
Script to populate Vietnamese address data (provinces, districts, wards)
Run this script after creating the database tables.
"""

import requests
from sqlalchemy.orm import sessionmaker

from app.database.session import engine
from app.model.address_model import District, Province, Ward


def fetch_address_data():
    """Fetch Vietnamese address data from the provinces API"""
    url = "https://provinces.open-api.vn/api/?depth=3"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"❌ Error fetching data from API: {e}")
        return None


def clear_existing_data(db):
    """Clear existing address data"""
    try:
        # Delete in reverse order due to foreign key constraints
        db.query(Ward).delete()
        db.query(District).delete()
        db.query(Province).delete()
        db.commit()
        print("✅ Cleared existing address data")
    except Exception as e:
        db.rollback()
        print(f"❌ Error clearing data: {e}")
        raise


def populate_address_data(clear_first=True):
    """Populate Vietnamese address data into database"""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        if clear_first:
            clear_existing_data(db)

        print("Fetching address data from API...")
        data = fetch_address_data()
        if not data:
            print("❌ Failed to fetch data from API")
            return

        print("Populating provinces...")
        province_map = {}
        district_map = {}

        for province_data in data:
            # Create province
            province = Province(
                Name=province_data["name"],
                Code=str(province_data["code"])
            )
            db.add(province)
            db.flush()  # Get ID
            province_map[province_data["code"]] = province.PK_Province

            # Create districts for this province
            if "districts" in province_data:
                for district_data in province_data["districts"]:
                    district = District(
                        ProvinceID=province.PK_Province,
                        Name=district_data["name"],
                        Code=str(district_data["code"])
                    )
                    db.add(district)
                    db.flush()  # Get ID
                    district_map[district_data["code"]] = district.PK_District

                    # Create wards for this district
                    if "wards" in district_data:
                        for ward_data in district_data["wards"]:
                            ward = Ward(
                                DistrictID=district.PK_District,
                                Name=ward_data["name"],
                                Code=str(ward_data["code"])
                            )
                            db.add(ward)

        db.commit()
        print("✅ Address data populated successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error populating address data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    populate_address_data()
