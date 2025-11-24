from pydantic import BaseModel, Field, validator


class AccountCreate(BaseModel):
    username: str
    password: str = Field(..., min_length=6, max_length=72)
    role_id: int
    phone: str

    @validator("phone")
    def phone_must_be_digits(cls, v):
        if not v.isdigit():
            raise ValueError("Phone number must contain only digits.")
        return v


class AccountLogin(BaseModel):
    username: str
    password: str


class AccountResponse(BaseModel):
    pk_account: int
    username: str
    role_id: int
    status: str

    model_config = {"from_attributes": True}
