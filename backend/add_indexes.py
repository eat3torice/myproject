#!/usr/bin/env python3
"""
Script to add database indexes for better performance
"""

from sqlalchemy import text

from app.database.session import engine


def add_indexes():
    """Add indexes to improve query performance"""
    try:
        with engine.connect() as conn:
            with open('add_indexes.sql', 'r') as f:
                sql = f.read()

            # Execute each statement
            for statement in sql.split(';'):
                statement = statement.strip()
                if statement and not statement.startswith('--'):
                    try:
                        conn.execute(text(statement))
                        print(f"✅ Executed: {statement[:50]}...")
                    except Exception as e:
                        print(f"⚠️  Warning: {e}")

            conn.commit()
            print("\n🎉 Indexes added successfully!")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    add_indexes()
