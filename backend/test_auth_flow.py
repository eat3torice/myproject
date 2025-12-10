from app.auth.auth_service import AuthService
from app.database.session import engine
from sqlalchemy.orm import sessionmaker
from app.model.account_model import Account

Session = sessionmaker(bind=engine)
session = Session()
auth = AuthService(session)

username = 'customer1'
password = 'cust123'

print(f"Testing authentication for: {username}")
print("-" * 50)

# Step 1: Check if account exists
account = session.query(Account).filter(Account.Username == username).first()
if account:
    print(f"✅ Account found: {account.Username}")
    print(f"   RoleID: {account.RoleID}")
    print(f"   Status: {account.Status}")
    print(f"   Password hash: {account.Password[:50]}...")
else:
    print("❌ Account not found")
    session.close()
    exit()

# Step 2: Test verify_password directly
print("\nTesting verify_password:")
result = auth.verify_password(password, account.Password)
print(f"   verify_password('{password}', hash): {result}")

# Step 3: Test authenticate_account
print("\nTesting authenticate_account:")
authenticated = auth.authenticate_account(username, password)
if authenticated:
    print(f"✅ Authentication successful!")
    print(f"   Username: {authenticated.Username}")
    print(f"   RoleID: {authenticated.RoleID}")
else:
    print("❌ Authentication failed!")

session.close()
