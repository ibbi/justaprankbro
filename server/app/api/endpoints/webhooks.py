import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core.config import get_settings
from app.models import Transaction

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
