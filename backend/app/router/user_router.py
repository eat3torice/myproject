from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import logging

from app.auth.dependencies import get_current_account
from app.auth.auth_service import AuthService
from app.database.session import get_db
from app.model.account_model import Account
from app.schema.account_schema import AccountLogin
from app.schema.user_schema import (
    ChangePassword,
    ForgotPasswordRequest,
    ResetPassword,
    UpdateProfile,
    UserProfile,
    UserRegister,
)
from app.service.user_service import UserService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/user", tags=["User"])


@router.post("/auth/login")
def user_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login cho customer (RoleID = 2) - OAuth2 compatible"""
    logger.info(f"User login attempt for username: {form_data.username}")
    auth_service = AuthService(db)
    db_account = auth_service.authenticate_account(form_data.username, form_data.password)
    
    if not db_account:
        user_exists = db.query(Account).filter(Account.Username == form_data.username).first()
        if not user_exists:
            logger.warning(f"Login failed - username not found: {form_data.username}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Username does not exist")
        else:
            logger.warning(f"Login failed - incorrect password for: {form_data.username}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password")
    logger.info(f"User login successful for: {form_data.username}, Role: {db_account.RoleID}")
    
    # Check account status
    if db_account.Status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Account is {db_account.Status}. Please contact administrator."
        )

    access_token = auth_service.create_access_token(data={"sub": db_account.Username, "role_id": db_account.RoleID})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role_id": db_account.RoleID,
        "account_status": db_account.Status
    }


@router.post("/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Đăng ký tài khoản khách hàng mới"""
    service = UserService(db)
    try:
        customer = service.register_user(user_data)
        return customer
    except ValueError as e:
        print(f"Registration error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Unexpected registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.get("/profile", response_model=UserProfile)
def get_profile(current_account=Depends(get_current_account), db: Session = Depends(get_db)):
    """Lấy thông tin profile của user đang đăng nhập"""
    service = UserService(db)
    profile = service.get_user_profile(current_account.PK_Account)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/profile", response_model=UserProfile)
def update_profile(
    profile_data: UpdateProfile, current_account=Depends(get_current_account), db: Session = Depends(get_db)
):
    """Cập nhật thông tin profile"""
    service = UserService(db)
    updated = service.update_user_profile(current_account.PK_Account, profile_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Profile not found")
    return updated


@router.post("/change-password")
def change_password(
    password_data: ChangePassword, current_account=Depends(get_current_account), db: Session = Depends(get_db)
):
    """Đổi mật khẩu"""
    service = UserService(db)
    try:
        success = service.change_password(
            current_account.PK_Account, password_data.old_password, password_data.new_password
        )
        if success:
            return {"message": "Password changed successfully"}
        else:
            raise HTTPException(status_code=404, detail="Account not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/verify-identity")
def verify_identity(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Xác thực danh tính user để reset password"""
    service = UserService(db)
    account = service.verify_user_identity(request.username, request.phone)
    if not account:
        raise HTTPException(status_code=404, detail="User not found or phone number doesn't match")
    return {"message": "Identity verified", "username": request.username}


@router.post("/reset-password")
def reset_password(reset_data: ResetPassword, db: Session = Depends(get_db)):
    """Reset mật khẩu sau khi xác thực danh tính"""
    service = UserService(db)
    try:
        success = service.reset_password(reset_data.username, reset_data.phone, reset_data.new_password)
        if success:
            return {"message": "Password reset successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
