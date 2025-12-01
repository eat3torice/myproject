from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.model.account_model import Account

oauth2 = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_account(db: Session = Depends(get_db), token: str = Depends(oauth2)) -> Account:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    account = db.query(Account).filter(Account.Username == username).first()
    if account is None:
        raise credentials_exception
    if account.Status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is not active"
        )
    return account


def get_current_admin_account(current_account: Account = Depends(get_current_account)) -> Account:
    """Dependency to ensure user has admin role (role_id = 1)"""
    if current_account.RoleID != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_account
