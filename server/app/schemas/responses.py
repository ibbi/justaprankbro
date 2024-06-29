from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class BaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseResponse):
    user_id: str
    email: EmailStr
    balance: int


class ScriptField(BaseModel):
    form_label: str
    variable_name: str
    textbox_type: str


class ScriptResponse(BaseModel):
    id: int
    title: str
    agent_id: str
    image: str
    sample_audio: str
    cost: int
    fields: list[ScriptField]


class CallHistoryResponse(BaseResponse):
    id: int
    create_time: datetime
    to_number: str
    link_to_recording: str | None
    script_title: str
    script_image: str | None
