from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.auth.auth_service import AuthService
from app.database.session import get_db
from app.model.account_model import Account
from app.schema.account_schema import AccountCreate, AccountLogin, AccountResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AccountResponse)
def register(account: AccountCreate, db: Session = Depends(get_db)):
    auth_service = AuthService(db)  # tạo instance với db
    db_account = auth_service.register_account(account)  # gọi qua instance
    return AccountResponse(
        pk_account=db_account.PK_Account,
        username=db_account.Username,
        role_id=db_account.RoleID,
        status=db_account.Status,
    )


@router.post("/login")
def login(account: AccountLogin, db: Session = Depends(get_db)):
    logger.info(f"Login attempt for username: {account.username}")
    auth_service = AuthService(db)  # tạo instance với db
    db_account = auth_service.authenticate_account(account.username, account.password)
    if not db_account:
        # Check if user exists
        user_exists = db.query(Account).filter(Account.Username == account.username).first()
        if not user_exists:
            logger.warning(f"Login failed - username not found: {account.username}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Username does not exist")
        else:
            logger.warning(f"Login failed - incorrect password for: {account.username}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password")

    logger.info(f"Login successful for: {account.username}, Role: {db_account.RoleID}")
    # Check account status
    if db_account.Status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Account is {db_account.Status}. Please contact administrator."
        )

    access_token = auth_service.create_access_token(data={"sub": db_account.Username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role_id": db_account.RoleID,
        "account_status": db_account.Status
    }
