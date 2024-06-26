import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from retell import Retell
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from twilio.request_validator import RequestValidator
from twilio.rest import Client as TwilioClient
from twilio.twiml.voice_response import VoiceResponse

from app.api import deps
from app.api.endpoints.sockets import manager
from app.core.config import get_settings
from app.models import Call, CallStatus, Script, Transaction

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
    settings = get_settings()

    form_data = await request.form()
    call_sid = form_data.get("CallSid")
    call_status = form_data.get("CallStatus")

    print(f"Received webhook for call {call_sid} with status {call_status}")

    # Fetch the Call record
    call = await session.scalar(select(Call).where(Call.twilio_call_sid == call_sid))
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    await session.execute(
        update(Call).where(Call.twilio_call_sid == call_sid).values(status=call_status)
    )
    await session.commit()

    await manager.send_status_update(call_sid, call_status)

    # if form_data.get("AnsweredBy") == "machine_start":
    #     response = VoiceResponse()
    #     response.hangup()
    #     return Response(content=str(response), media_type="application/xml")

    # If call is in progress, set up Retell
    if call_status == CallStatus.IN_PROGRESS:
        # Fetch the associated Script
        script = await session.get(Script, call.script_id)
        if not script:
            raise HTTPException(status_code=404, detail="Script not found")

        # Initialize Retell
        retell_client = Retell(api_key=settings.retell.api_key.get_secret_value())

        # Set up Retell agent based on script
        agent_id = script.agent_id
        if agent_id == "custom":
            dynamic_vars = call.dynamic_vars or {}
            llm = retell_client.llm.create(
                general_prompt=dynamic_vars.get("general_prompt")
                or script.fields.get("general_prompt"),
                begin_message=dynamic_vars.get("begin_message")
                or script.fields.get("begin_message", ""),
            )

            agent = retell_client.agent.create(
                llm_websocket_url=llm.llm_websocket_url,
                voice_id=dynamic_vars.get("voice_id") or script.fields.get("voice_id"),
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
            retell_llm_dynamic_variables=call.dynamic_vars,
        )

        response = VoiceResponse()
        # Start streaming to our backend
        start = response.start()
        start.stream(url=f"wss://{request.headers['host']}/ws/stream")

        # Connect to Retell
        connect = response.connect()
        connect.stream(
            url=f"wss://api.retellai.com/audio-websocket/{retell_call.call_id}"
        )

        print("chinngg", f"wss://{request.headers['Host']}/ws/stream")

        return Response(content=str(response), media_type="application/xml")

    if call_status == CallStatus.COMPLETED:
        recording_url = form_data.get("RecordingUrl")
        if recording_url:
            # Create a Twilio client
            twilio_client = TwilioClient(
                settings.twilio.account_sid,
                settings.twilio.auth_token.get_secret_value(),
            )
            print("Raw URL", recording_url)

            # Get the recording instance
            recording = twilio_client.recordings.get(
                form_data.get("RecordingSid")
            ).fetch()
            print("sid URL", recording)

            # Generate a publicly accessible URL for the recording
            public_recording_url = recording.media_url
            print("public URL", public_recording_url)

            await session.execute(
                update(Call)
                .where(Call.twilio_call_sid == call_sid)
                .values(link_to_recording=public_recording_url)
            )
            await session.commit()
            # Send recording URL through WebSocket
            await manager.send_status_update(
                call_sid, call_status, public_recording_url
            )

    return Response(content="", media_type="application/xml")
