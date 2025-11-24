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
    return account
