from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models import Script
from app.schemas.responses import ScriptResponse

router = APIRouter()

SCRIPTS = {
    "HIT_CAR": {
        "title": "You hit my car",
        "agentId": "c23574a71b5acb7984f27dd45bada7c7",
        "image": "https://prankring.com/images/hit_car.png",
        "sample_audio": "hit_car_sample.mp3",
        "fields": [
            {"form_label": "Name", "variable_name": "name", "textbox_type": "text"},
            {"form_label": "Color", "variable_name": "color", "textbox_type": "text"},
            {"form_label": "Make", "variable_name": "make", "textbox_type": "text"},
            {
                "form_label": "Address",
                "variable_name": "address",
                "textbox_type": "text",
            },
        ],
    },
    "CALL_GIRL": {
        "title": "You called my girl",
        "agentId": "66eea2569a592280505a9dc9593fc00c",
        "image": "https://prankring.com/images/call_girl.png",
        "sample_audio": "call_girl_sample.mp3",
        "fields": [
            {"form_label": "Name", "variable_name": "name", "textbox_type": "text"},
            {
                "form_label": "Girlfriend's name",
                "variable_name": "gf_name",
                "textbox_type": "text",
            },
        ],
    },
    "CUSTOM": {
        "title": "Custom script",
        "agentId": "custom",
        "image": "https://prankring.com/images/custom_script.png",
        "sample_audio": "custom_sample.mp3",
        "fields": [
            {
                "form_label": "General Prompt",
                "variable_name": "general_prompt",
                "textbox_type": "textarea",
            },
            {
                "form_label": "Begin Message",
                "variable_name": "begin_message",
                "textbox_type": "text",
            },
            {
                "form_label": "Voice ID",
                "variable_name": "voice_id",
                "textbox_type": "text",
            },
        ],
    },
}

router = APIRouter()


@router.get(
    "/",
    response_model=list[ScriptResponse],
    description="Get available prank call scripts",
)
async def get_scripts(
    session: AsyncSession = Depends(deps.get_session),
):
    query = select(Script)
    result = await session.execute(query)
    scripts = result.scalars().all()
    return scripts
