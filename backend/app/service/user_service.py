from datetime import datetime

from argon2 import PasswordHasher
from sqlalchemy.orm import Session

from app.auth.auth_service import AuthService
from app.model.account_model import Account
from app.model.customer_model import Customer
from app.model.role_model import Role
from app.schema.user_schema import UpdateProfile, UserRegister

pwd_hasher = PasswordHasher()


class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.auth_service = AuthService(db)

    def register_user(self, user_data: UserRegister):
        """Đăng ký tài khoản khách hàng mới"""
        # Check if username exists
        existing = self.db.query(Account).filter(Account.Username == user_data.username).first()
        if existing:
            raise ValueError("Username already exists")

        # Validate and truncate password if necessary
        # password = user_data.password[:72] if len(user_data.password) > 72 else user_data.password

        # Get or create customer role
        customer_role = self.db.query(Role).filter(Role.Name == "customer").first()
        if not customer_role:
            customer_role = Role(Name="customer")
            self.db.add(customer_role)
            self.db.flush()

        # Create account
        hashed_password = pwd_hasher.hash(user_data.password)
        account = Account(
            Username=user_data.username, Password=hashed_password, RoleID=customer_role.PK_Role, Status="active"
        )
        self.db.add(account)
        self.db.flush()

        # Create customer profile
        customer = Customer(
            AccountID=account.PK_Account,
            Name=user_data.name,
            Phone=user_data.phone,
            Address=user_data.address,
            Status="active",
            Creation_date=datetime.now(),
        )
        self.db.add(customer)
        self.db.commit()
        self.db.refresh(customer)

        return customer

    def get_user_profile(self, account_id: int):
        """Lấy thông tin profile của user"""
        return self.db.query(Customer).filter(Customer.AccountID == account_id).first()

    def update_user_profile(self, account_id: int, profile_data: UpdateProfile):
        """Cập nhật thông tin profile"""
        customer = self.db.query(Customer).filter(Customer.AccountID == account_id).first()
        if not customer:
            return None

        if profile_data.name:
            customer.Name = profile_data.name
        if profile_data.phone:
            customer.Phone = profile_data.phone
        if profile_data.address:
            customer.Address = profile_data.address

        customer.Edit_date = datetime.now()
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def change_password(self, account_id: int, old_password: str, new_password: str):
        """Đổi mật khẩu"""
        account = self.db.query(Account).filter(Account.PK_Account == account_id).first()
        if not account:
            return False

        # Verify old password
        try:
            pwd_hasher.verify(account.Password, old_password)
        except Exception:
            raise ValueError("Old password is incorrect")

        # Update password
        account.Password = pwd_hasher.hash(new_password)
        self.db.commit()
        return True
