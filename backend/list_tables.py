from sqlalchemy import inspect

from app.database.base_class import Base
from app.database.session import engine

inspector = inspect(engine)
tables = inspector.get_table_names()

print(f"Total tables: {len(tables)}\n")
print("All tables in database:")
print("=" * 50)
for table in sorted(tables):
    print(f"  - {table}")

print("\n" + "=" * 50)
print("\nTables defined in models:")
print("=" * 50)


for mapper in Base.registry.mappers:
    print(f"  - {mapper.class_.__tablename__}")

print("\n" + "=" * 50)
print("\nUnused tables (in DB but not in models):")
print("=" * 50)

model_tables = {mapper.class_.__tablename__ for mapper in Base.registry.mappers}
unused = set(tables) - model_tables

if unused:
    for table in sorted(unused):
        print(f"  - {table}")
else:
    print("  No unused tables found")
