from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models import User
from app.schemas.requests import UserCreateRequest
from app.schemas.responses import UserResponse

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
    return user


@router.get("/me", response_model=UserResponse, description="Get current user")
async def read_current_user(
    current_user: User = Depends(deps.get_current_user),
) -> User:
    return current_user


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
