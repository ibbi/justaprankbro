import boto3
import requests
import stripe
from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from retell import Retell
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from twilio.request_validator import RequestValidator
from twilio.twiml.voice_response import VoiceResponse

from app.api import deps
from app.api.endpoints.stream import client_socket_manager
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


async def update_db_call_status(session, call_sid, call_status):
    await session.execute(
        update(Call).where(Call.twilio_call_sid == call_sid).values(status=call_status)
    )
    await session.commit()


@router.post("/twilio")
async def twilio_voice_webhook(
    request: Request, session: AsyncSession = Depends(deps.get_session)
):
    await validate_twilio_request(request)
    settings = get_settings()

    form_data = await request.form()
    call_sid = form_data.get("CallSid")
    call_status = form_data.get("CallStatus")

    print(form_data)

    # Fetch the Call record
    call = await session.scalar(select(Call).where(Call.twilio_call_sid == call_sid))
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    if call_status in CallStatus:
        await update_db_call_status(session, call_sid, call_status)

        await client_socket_manager.send_status_update(call_sid, call_status)

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
        start_out = response.start()
        start_in = response.start()
        start_out.stream(
            url=f"wss://{request.headers['host']}/stream/twilio_outbound",
            track="outbound_track",
        )
        start_in.stream(
            url=f"wss://{request.headers['host']}/stream/twilio_inbound",
            track="inbound_track",
        )

        # Connect to Retell
        connect = response.connect()
        connect.stream(
            url=f"wss://api.retellai.com/audio-websocket/{retell_call.call_id}"
        )

        return Response(content=str(response), media_type="application/xml")

    recording_url = form_data.get("RecordingUrl")
    recording_status = form_data.get("RecordingStatus")
    if recording_url and recording_status:
        # Append .mp3 to get the MP3 version of the recording
        print("we doin it")
        mp3_url = f"{recording_url}.mp3"

        # Download the MP3 file
        response = requests.get(
            mp3_url,
            auth=(
                settings.twilio.account_sid,
                settings.twilio.auth_token.get_secret_value(),
            ),
        )

        if response.ok:
            # Create an S3 client
            s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.aws.access_key_id,
                aws_secret_access_key=settings.aws.secret_access_key.get_secret_value(),
                region_name=settings.aws.region,
            )

            # Generate a unique filename
            filename = f"recordings/{call_sid}.mp3"

            try:
                # Upload the file to S3
                s3_client.put_object(
                    Bucket=settings.aws.s3_bucket_name,
                    Key=filename,
                    Body=response.content,
                    ContentType="audio/mpeg",
                )

                # Generate a presigned URL that doesn't expire
                s3_url = s3_client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": settings.aws.s3_bucket_name, "Key": filename},
                    ExpiresIn=3153600000,  # 100 years in seconds
                )

                # Update the database with the S3 URL
                await session.execute(
                    update(Call)
                    .where(Call.twilio_call_sid == call_sid)
                    .values(link_to_recording=s3_url)
                )
                await session.commit()

                # Send S3 URL through WebSocket
                await client_socket_manager.send_status_update(
                    call_sid, call_status, s3_url
                )

            except ClientError as e:
                print(f"Error uploading to S3: {e}")

        else:
            print(f"Error downloading recording: {response.status_code}")

    return Response(content="", media_type="application/xml")
