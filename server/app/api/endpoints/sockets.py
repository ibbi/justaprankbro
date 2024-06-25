from fastapi import APIRouter, Depends, HTTPException, WebSocket
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models import Call, User

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, call_id: str):
        await websocket.accept()
        self.active_connections[call_id] = websocket

    def disconnect(self, call_id: str):
        if call_id in self.active_connections:
            del self.active_connections[call_id]

    async def send_status_update(self, call_id: str, status: str):
        if call_id in self.active_connections:
            await self.active_connections[call_id].send_json({"status": status})


manager = ConnectionManager()


async def get_call_or_raise(call_id: str, session: AsyncSession) -> Call:
    call = await session.scalar(select(Call).where(Call.id == call_id))
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    return call


@router.websocket("/{call_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    call_id: str,
    session: AsyncSession = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_user),
):
    call = await get_call_or_raise(call_id, session)
    if call.user_id != current_user.user_id:
        await websocket.close(code=4003)
        return

    await manager.connect(websocket, call_id)
    try:
        while True:
            # Wait for WebSocket closure
            await websocket.receive_text()
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        manager.disconnect(call_id)
