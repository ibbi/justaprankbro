from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from retell import Retell
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.core.config import get_settings
from app.models import Call, Script, User
from app.schemas.requests import CallCreateRequest

router = APIRouter()


@router.post("/")
async def make_call(
    request: CallCreateRequest,
    session: AsyncSession = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_user),
):
    phone_number = request.phone_number
    script_id = request.script_id
    dynamic_vars = request.dynamic_vars

    script = await session.get(Script, script_id)
    if not script:
        return JSONResponse(content={"error": "Script not found"}, status_code=404)

    agent_id = script.agent_id

    api_key = get_settings().retell.api_key.get_secret_value()
    client = Retell(api_key=api_key)

    if agent_id == "custom":
        llm = client.llm.create(
            general_prompt=dynamic_vars.get("general_prompt"),
            begin_message=dynamic_vars.get("begin_message", ""),
        )

        agent = client.agent.create(
            llm_websocket_url=llm.llm_websocket_url,
            voice_id=dynamic_vars.get("voice_id"),
            agent_name="Custom Agent",
        )

        agent_id = agent.agent_id

    call = client.call.create(
        from_number="+15597447125",
        to_number=phone_number,
        override_agent_id=agent_id,
        retell_llm_dynamic_variables=dynamic_vars,
        drop_call_if_machine_detected=True,
    )

    call_log = Call(
        from_number=call.from_number,
        to_number=call.to_number,
        script_id=script_id,
        user_id=current_user.user_id,
    )
    session.add(call_log)
    await session.commit()
    await session.refresh(call_log)

    return JSONResponse(content=call.dict())


@router.get("/{call_id}")
async def get_call(call_id: str):
    api_key = get_settings().retell.api_key
    client = Retell(api_key=api_key)

    call = client.call.retrieve(call_id=call_id)

    return JSONResponse(content=call.dict())
