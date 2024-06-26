from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from firebase_admin import auth
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


async def get_current_user_ws(websocket: WebSocket, session: AsyncSession) -> User:
    try:
        token = await websocket.receive_text()
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token["uid"]
        user = await session.scalar(
            select(User).where(User.firebase_uid == firebase_uid)
        )
        if user is None:
            await websocket.close(code=4001)
            return None
        return user
    except Exception:
        await websocket.close(code=4001)
        return None


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
):
    await websocket.accept()

    user = await get_current_user_ws(websocket, session)
    if not user:
        return

    call = await session.scalar(select(Call).where(Call.id == call_id))
    if not call or call.user_id != user.user_id:
        await websocket.close(code=4003)
        return

    await manager.connect(websocket, call_id)
    try:
        while True:
            await websocket.receive_text()
            # Handle any client messages if needed
    except WebSocketDisconnect:
        manager.disconnect(call_id)
