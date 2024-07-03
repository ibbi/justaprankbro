from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import and_, delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models import Call, CallStatus, Script, Transaction, User
from app.schemas.requests import UserCreateRequest
from app.schemas.responses import CallHistoryResponse, UserResponse

router = APIRouter()


@router.post(
    "/create",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    description="Create new user",
)
async def create_user(
    request: UserCreateRequest,
    firebase_uid: Annotated[str, Depends(deps.get_firebase_uid)],
    session: AsyncSession = Depends(deps.get_session),
) -> User:
    user = User(firebase_uid=firebase_uid, email=request.email)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    transaction = Transaction(value=1, user_id=user.user_id)
    session.add(transaction)
    await session.commit()

    balance = await session.scalar(
        select(func.sum(Transaction.value)).where(Transaction.user_id == user.user_id)
    )
    if balance is None:
        balance = 0

    return UserResponse(user_id=user.user_id, email=user.email, balance=balance)


@router.get("/me", response_model=UserResponse, description="Get current user")
async def read_current_user(
    current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
) -> User:
    balance = await session.scalar(
        select(func.sum(Transaction.value)).where(
            Transaction.user_id == current_user.user_id
        )
    )
    if balance is None:
        balance = 0

    return UserResponse(
        user_id=current_user.user_id, email=current_user.email, balance=balance
    )


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
    description="Delete current user",
)
async def delete_current_user(
    current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
) -> None:
    await session.execute(delete(User).where(User.user_id == current_user.user_id))
    await session.commit()


@router.get(
    "/me/call-history",
    response_model=list[CallHistoryResponse],
    description="Get call history for current user",
)
async def get_call_history(
    current_user: User = Depends(deps.get_current_user),
    session: AsyncSession = Depends(deps.get_session),
) -> list[CallHistoryResponse]:
    query = (
        select(Call, Script.title, Script.image)
        .join(Script, Call.script_id == Script.id)
        .where(
            and_(
                Call.user_id == current_user.user_id,
                Call.status == CallStatus.COMPLETED,
            )
        )
        .order_by(Call.create_time.desc())
    )

    result = await session.execute(query)
    calls = result.all()

    return [
        CallHistoryResponse(
            id=call.Call.id,
            create_time=call.Call.create_time,
            to_number=call.Call.to_number,
            link_to_recording=call.Call.link_to_recording,
            script_title=call.title,
            script_image=call.image,
        )
        for call in calls
    ]
