import stripe
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core.config import get_settings
from app.models import User

router = APIRouter()


class CreateCheckoutSessionRequest(BaseModel):
    credits: str


@router.post("/create")
async def create(
    request: CreateCheckoutSessionRequest,
    current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
):
    try:
        settings = get_settings()
        price_id = getattr(settings.stripe, f"price_id_{request.credits}")

        checkout_session = stripe.checkout.Session.create(
            ui_mode="embedded",
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ],
            mode="payment",
            client_reference_id=current_user.user_id,
            redirect_on_completion="never",
        )

        return {"clientSecret": checkout_session.client_secret}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
