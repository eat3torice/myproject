from datetime import datetime, timedelta

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from jose import jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.model.account_model import Account
from app.schema.account_schema import AccountCreate

ph = PasswordHasher()


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def hash_password(password: str) -> str:
        return ph.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            return ph.verify(hashed_password, plain_password)  # đúng thứ tự
        except VerifyMismatchError:
            return False

    def create_access_token(self, data: dict, expires_delta: timedelta | None = None) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + (
            expires_delta if expires_delta else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    def register_account(self, account: AccountCreate) -> Account:
        # Check if username already exists
        if self.db.query(Account).filter(Account.Username == account.username).first():
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Username already exists.")

        hashed_password = self.hash_password(account.password)
        db_account = Account(
            Username=account.username,
            Password=hashed_password,
            RoleID=account.role_id,
            Status="ACTIVE"
        )
        self.db.add(db_account)
        self.db.commit()
        self.db.refresh(db_account)
        return db_account

    def authenticate_account(self, username: str, password: str) -> Account | None:
        account = self.db.query(Account).filter(Account.Username == username).first()
        if account and self.verify_password(password, account.Password):
            return account
        return None
