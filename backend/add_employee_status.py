#!/usr/bin/env python3
"""
Migration script to add status column to employee table
"""
import os
import sys

from sqlalchemy import create_engine, text

# Add the current directory to the path so we can import from app
sys.path.insert(0, os.path.dirname(__file__))

from app.core.config import settings


def run_migration():
    """Add status column to employee table"""
    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        # Check if status column already exists
        result = conn.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'employee' AND column_name = 'status'
        """))

        if result.fetchone():
            print("Status column already exists in employee table")
            return

        # Add status column with default value 'ACTIVE'
        print("Adding status column to employee table...")
        conn.execute(text("""
            ALTER TABLE employee
            ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE'
        """))

        # Update existing records to have ACTIVE status
        conn.execute(text("""
            UPDATE employee
            SET status = 'ACTIVE'
            WHERE status IS NULL
        """))

        conn.commit()
        print("Migration completed successfully!")

if __name__ == "__main__":
    run_migration()
