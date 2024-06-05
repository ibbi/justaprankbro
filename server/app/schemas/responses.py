from pydantic import BaseModel, ConfigDict, EmailStr


class BaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseResponse):
    user_id: str
    email: EmailStr


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
