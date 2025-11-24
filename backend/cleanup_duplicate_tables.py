from sqlalchemy import text

from app.database.session import engine

# Danh sách bảng cần xóa (các bảng uppercase duplicate)
tables_to_drop = [
    "Account",
    "Brand",
    "CartItem",
    "Category",
    "Customer",
    "Employee",
    "Images",
    "OrderLine",
    "POSOrder",
    "PaymentMethod",
    "Product",
    "Role",
    "Variation",
    "cartItem",  # Cũng là duplicate
]

print("⚠️  WARNING: This will DROP the following tables:")
print("=" * 50)
for table in tables_to_drop:
    print(f"  - {table}")
print("=" * 50)

confirm = input("\nType 'YES' to confirm deletion: ")

if confirm == "YES":
    with engine.begin() as conn:
        for table in tables_to_drop:
            try:
                conn.execute(text(f'DROP TABLE IF EXISTS "{table}" CASCADE'))
                print(f"✓ Dropped table: {table}")
            except Exception as e:
                print(f"✗ Error dropping {table}: {e}")

    print("\n✅ Cleanup completed!")

    # Verify
    from sqlalchemy import inspect

    inspector = inspect(engine)
    remaining = inspector.get_table_names()
    print(f"\nRemaining tables: {len(remaining)}")
    for table in sorted(remaining):
        print(f"  - {table}")
else:
    print("❌ Cancelled")
