from argon2 import PasswordHasher
from app.database.session import engine
from sqlalchemy.orm import sessionmaker
from app.model.account_model import Account

ph = PasswordHasher()
Session = sessionmaker(bind=engine)
session = Session()

acc = session.query(Account).filter(Account.Username == 'customer1').first()
print(f"Username: {acc.Username}")
print(f"Password hash: {acc.Password}")

try:
    ph.verify(acc.Password, 'cust123')
    print("✅ Password verification: SUCCESS")
except Exception as e:
    print(f"❌ Password verification: FAILED - {e}")

session.close()
