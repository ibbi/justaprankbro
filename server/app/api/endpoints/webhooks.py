import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from retell import Retell
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from twilio.request_validator import RequestValidator

from app.api import deps
from app.core.config import get_settings
from app.models import Call, Script, Transaction

router = APIRouter()


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    session: AsyncSession = Depends(deps.get_session),
):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature", None)

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, get_settings().stripe.webhook_secret.get_secret_value()
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail=str(e))
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail=str(e))

    # if event.type == "payment_intent.succeeded":
    #     print("strippp payment_intent.succeeded")
    #     print(json.dumps(event))

    if event.type == "checkout.session.completed":
        user_id = event.data.object.client_reference_id

        transaction = Transaction(value=5, user_id=user_id)
        session.add(transaction)
        await session.commit()

    return {"status": "success"}


async def validate_twilio_request(request: Request):
    settings = get_settings()
    validator = RequestValidator(settings.twilio.auth_token.get_secret_value())

    form_data = await request.form()
    signature = request.headers.get("X-Twilio-Signature", "")
    url = str(request.url)

    if not validator.validate(url, form_data, signature):
        raise HTTPException(status_code=400, detail="Invalid Twilio signature")


@router.post("/twilio")
async def twilio_voice_webhook(
    request: Request, session: AsyncSession = Depends(deps.get_session)
):
    await validate_twilio_request(request)

    form_data = await request.form()
    call_sid = form_data.get("CallSid")

    # Fetch the Call record
    call = await session.scalar(select(Call).where(Call.twilio_call_sid == call_sid))
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    # Fetch the associated Script
    script = await session.get(Script, call.script_id)
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")

    # Initialize Retell
    settings = get_settings()
    retell_client = Retell(api_key=settings.retell.api_key.get_secret_value())

    # Set up Retell agent based on script
    agent_id = script.agent_id
    if agent_id == "custom":
        llm = retell_client.llm.create(
            general_prompt=script.fields.get("general_prompt"),
            begin_message=script.fields.get("begin_message", ""),
        )

        agent = retell_client.agent.create(
            llm_websocket_url=llm.llm_websocket_url,
            voice_id=script.fields.get("voice_id"),
            agent_name="Custom Agent",
        )

        agent_id = agent.agent_id

    # Register the call with Retell
    retell_call = retell_client.call.register(
        agent_id=agent_id,
        audio_websocket_protocol="twilio",
        audio_encoding="mulaw",
        sample_rate=8000,
        from_number=call.from_number,
        to_number=call.to_number,
    )

    # Generate TwiML response
    twiml_response = f"""
    <?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Connect>
            <Stream url="wss://api.retellai.com/audio-websocket/{retell_call.call_id}" />
        </Connect>
    </Response>
    """

    return Response(content=twiml_response, media_type="application/xml")
