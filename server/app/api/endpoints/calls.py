from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client as TwilioClient

from app.api import deps
from app.core.config import get_settings
from app.models import Call, CallStatus, Script, Transaction, User
from app.schemas.requests import CallCreateRequest

router = APIRouter()


async def create_twilio_call(
    phone_number: str,
    script_id: int,
    dynamic_vars: dict,
    session: AsyncSession,
    current_user: User,
):
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
            record=True,
            machine_detection="Enable",
            async_amd="true",
            async_amd_status_callback=f"{settings.base_url}/webhooks/twilio",
            recording_status_callback=f"{settings.base_url}/webhooks/twilio",
            status_callback=f"{settings.base_url}/webhooks/twilio",
            status_callback_event=["initiated", "ringing", "answered", "completed"],
        )

        call_log = Call(
            from_number=call._from,
            to_number=call.to,
            script_id=script_id,
            user_id=current_user.user_id,
            twilio_call_sid=call.sid,
            status=CallStatus.QUEUED,
            dynamic_vars=dynamic_vars,
        )
        session.add(call_log)
        await session.commit()
        await session.refresh(call_log)

        return {
            "call_sid": call.sid,
            "status": call.status,
            "from": call._from,
            "to": call.to,
        }

    except TwilioRestException as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/")
async def make_call(
    request: CallCreateRequest,
    session: AsyncSession = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_user),
):
    # Get the script to check its cost
    script = await session.get(Script, request.script_id)
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")

    # Check user's balance
    balance = await session.scalar(
        select(func.sum(Transaction.value)).where(
            Transaction.user_id == current_user.user_id
        )
    )
    if balance is None:
        balance = 0

    if balance < script.cost:
        raise HTTPException(status_code=400, detail="Insufficient credits")

    # Make the call
    result = await create_twilio_call(
        request.phone_number,
        request.script_id,
        request.dynamic_vars,
        session,
        current_user,
    )

    # Deduct credits
    transaction = Transaction(value=-script.cost, user_id=current_user.user_id)
    session.add(transaction)
    await session.commit()

    return JSONResponse(content=result)


@router.post("/retry")
async def retry_call(
    session: AsyncSession = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_user),
):
    # Get the most recent call for the current user
    query = (
        select(Call)
        .where(Call.user_id == current_user.user_id)
        .order_by(Call.create_time.desc())
    )
    result = await session.execute(query)
    latest_call = result.scalars().first()

    if not latest_call:
        raise HTTPException(status_code=404, detail="No previous call found")

    invalid_statuses = [CallStatus.FAILED, CallStatus.BUSY, CallStatus.NO_ANSWER]
    if latest_call.status not in invalid_statuses:
        raise HTTPException(
            status_code=400, detail="Latest call is not in a retry-eligible status"
        )

    result = await create_twilio_call(
        latest_call.to_number,
        latest_call.script_id,
        latest_call.dynamic_vars,
        session,
        current_user,
    )
    return JSONResponse(content=result)
