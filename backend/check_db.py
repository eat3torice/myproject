from sqlalchemy import create_engine, text

engine = create_engine("postgresql+psycopg2://postgres:123456789@localhost:5432/test")

with engine.connect() as conn:
    # Check variations
    result = conn.execute(text("SELECT COUNT(*) FROM variation"))
    count = result.scalar()
    print(f"Total variations: {count}")

    if count > 0:
        result = conn.execute(text("SELECT * FROM variation LIMIT 5"))
        print("\nSample variations:")
        for row in result:
            print(f"  {row}")

    # Check active variations with stock
    result = conn.execute(text("SELECT COUNT(*) FROM variation WHERE status = 'ACTIVE' AND quantity > 0"))
    active_count = result.scalar()
    print(f"\nActive variations with stock: {active_count}")

    # Check all statuses
    result = conn.execute(text("SELECT DISTINCT status FROM variation"))
    statuses = [row[0] for row in result]
    print(f"Variation statuses in DB: {statuses}")
