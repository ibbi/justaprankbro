import stripe
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core.config import get_settings
from app.models import User

router = APIRouter()


@router.post("/create")
async def create(
    current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    try:
        checkout_session = stripe.checkout.Session.create(
            ui_mode="embedded",
            line_items=[
                {
                    "price": get_settings().stripe.price_id_5,
                    "quantity": 1,
                }
            ],
            mode="payment",
            client_reference_id=current_user.user_id,
            redirect_on_completion="never",
            payment_intent_data={"user_id": current_user.user_id},
        )

        # Update user's balance after successful payment
        # transaction = Transaction(value=5, user_id=current_user.user_id)
        # session.add(transaction)
        # await session.commit()

        return {"clientSecret": checkout_session.client_secret}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
