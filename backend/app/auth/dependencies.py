from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
import logging

from app.core.config import settings
from app.database.session import get_db
from app.model.account_model import Account

# Swagger will use this tokenUrl for the Authorize button
# But it works with any login endpoint that returns access_token
oauth2 = OAuth2PasswordBearer(tokenUrl="user/auth/login")
logger = logging.getLogger(__name__)


def get_current_account(db: Session = Depends(get_db), token: str = Depends(oauth2)) -> Account:
    logger.debug(f"Validating token: {token[:20]}...")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        logger.debug(f"Token decoded, username: {username}")
        if username is None:
            logger.warning("Token payload missing 'sub' field")
            raise credentials_exception
    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        raise credentials_exception
    account = db.query(Account).filter(Account.Username == username).first()
    if account is None:
        logger.warning(f"Account not found for username: {username}")
        raise credentials_exception
    if account.Status != "ACTIVE":
        logger.warning(f"Account not active: {username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is not active"
        )
    logger.debug(f"Authentication successful for: {username}")
    return account


def get_current_admin_account(current_account: Account = Depends(get_current_account)) -> Account:
    """Dependency to ensure user has admin role (role_id = 1)"""
    if current_account.RoleID != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_account
