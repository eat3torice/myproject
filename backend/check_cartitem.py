from sqlalchemy import inspect

from app.database.session import engine

inspector = inspect(engine)
columns = inspector.get_columns("cartitem")
print("CartItem columns:")
for col in columns:
    print(f"  - {col['name']} ({col['type']})")
