from pydantic import BaseModel, EmailStr


class BaseRequest(BaseModel):
    # may define additional fields or config shared across requests
    pass


class UserCreateRequest(BaseRequest):
    email: EmailStr


class CallCreateRequest(BaseRequest):
    phone_number: str
    script_id: str
    dynamic_vars: dict[str, str]
