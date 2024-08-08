from pydantic import BaseModel, EmailStr


class BaseRequest(BaseModel):
    # may define additional fields or config shared across requests
    pass


class UserCreateRequest(BaseModel):
    email: EmailStr
    ref_code: str


class CallCreateRequest(BaseRequest):
    phone_number: str
    script_id: int
    dynamic_vars: dict[str, str]
