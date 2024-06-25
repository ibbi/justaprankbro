import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client as TwilioClient

from app.api import deps
from app.core.config import get_settings
from app.models import Call, Script, User
from app.schemas.requests import CallCreateRequest

router = APIRouter()


@router.post("/")
async def make_call(
    request: CallCreateRequest,
    session: AsyncSession = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_user),
):
    phone_number = request.phone_number
    script_id = request.script_id
    # dynamic_vars = request.dynamic_vars

    twilio_number = "+19148735587"
    # twilio_number = "++15005550006"

    script = await session.get(Script, script_id)
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")

    settings = get_settings()
    twilio_client = TwilioClient(
        settings.twilio.account_sid, settings.twilio.auth_token.get_secret_value()
    )

    try:
        call = twilio_client.calls.create(
            to=phone_number,
            from_=twilio_number,
            url=f"{settings.base_url}/webhooks/twilio",
        )

        call_log = Call(
            from_number=call._from,
            to_number=call.to,
            script_id=script_id,
            user_id=current_user.user_id,
            twilio_call_sid=call.sid,
        )
        session.add(call_log)
        await session.commit()
        await session.refresh(call_log)

        return JSONResponse(
            content={
                "call_sid": call.sid,
                "status": call.status,
                "from": call._from,
                "to": call.to,
            }
        )

    except TwilioRestException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{call_id}")
async def get_call(call_id: str):
    settings = get_settings()
    twilio_client = TwilioClient(
        settings.twilio.account_sid, settings.twilio.auth_token.get_secret_value()
    )

    try:
        call = twilio_client.calls(call_id).fetch()
        return JSONResponse(
            content={
                "call_sid": call.sid,
                "status": call.status,
                "from": call._from,
                "to": call.to,
                "duration": call.duration,
            }
        )
    except TwilioRestException as e:
        raise HTTPException(status_code=400, detail="error: " + json.dumps(e))
