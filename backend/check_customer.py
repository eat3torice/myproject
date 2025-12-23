from sqlalchemy.orm import sessionmaker
from app.database.session import engine
from app.model.customer_model import Customer
from app.model.account_model import Account

Session = sessionmaker(bind=engine)
db = Session()

acc = db.query(Account).filter(Account.Username == 'customer1').first()
if acc:
    print(f"✅ Account found: customer1 (ID: {acc.PK_Account})")
    cust = db.query(Customer).filter(Customer.AccountID == acc.PK_Account).first()
    if cust:
        print(f"✅ Customer profile exists (ID: {cust.PK_Customer})")
    else:
        print(f"❌ Customer profile NOT found for customer1")
        print(f"   Need to create customer profile for AccountID: {acc.PK_Account}")
else:
    print("❌ Account customer1 not found")

db.close()
