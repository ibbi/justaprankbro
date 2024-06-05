from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models import Script
from app.schemas.responses import ScriptResponse

router = APIRouter()


@router.get(
    "/",
    response_model=list[ScriptResponse],
    description="Get available prank call scripts",
)
async def get_scripts(
    session: AsyncSession = Depends(deps.get_session),
):
    query = select(Script)
    result = await session.execute(query)
    scripts = result.scalars().all()
    return scripts
