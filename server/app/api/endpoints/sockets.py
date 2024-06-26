from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from firebase_admin import auth
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models import Call, User

router = APIRouter()


class StatusManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
        self.audio_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, call_sid: str):
        self.active_connections[call_sid] = websocket

    def disconnect(self, call_sid: str):
        if call_sid in self.active_connections:
            del self.active_connections[call_sid]

    async def send_status_update(
        self, call_sid: str, status: str, recording_url: str = None
    ):
        if call_sid in self.active_connections:
            await self.active_connections[call_sid].send_json(
                {"status": status, "recording_url": recording_url}
            )


status_manager = StatusManager()


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


@router.websocket("/{call_sid}")
async def websocket_endpoint(
    websocket: WebSocket,
    call_sid: str,
    session: AsyncSession = Depends(deps.get_session),
):
    await websocket.accept()

    user = await get_current_user_ws(websocket, session)
    if not user:
        return

    call = await session.scalar(select(Call).where(Call.twilio_call_sid == call_sid))
    if not call or call.user_id != user.user_id:
        await websocket.close(code=4003)
        return

    await status_manager.connect(websocket, call_sid)
    try:
        while True:
            await websocket.receive_json()
    # Handle any client messages if needed
    except WebSocketDisconnect:
        status_manager.disconnect(call_sid)


class AudioStreamManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, call_sid: str):
        await websocket.accept()
        self.active_connections[call_sid] = websocket
        print(f"WebSocket connection established for call {call_sid}")

    def disconnect(self, call_sid: str):
        if call_sid in self.active_connections:
            del self.active_connections[call_sid]
            print(f"WebSocket connection closed for call {call_sid}")

    async def receive_audio(self, call_sid: str, data: bytes):
        print(f"Received audio chunk for call {call_sid}, size: {len(data)} bytes")
        # Here you can process the audio data as needed


audio_manager = AudioStreamManager()


@router.websocket("/audio/{call_sid}")
async def audio_websocket_endpoint(
    websocket: WebSocket,
    call_sid: str,
    session: AsyncSession = Depends(deps.get_session),
):
    await audio_manager.connect(websocket, call_sid)
    try:
        while True:
            data = await websocket.receive_bytes()
            await audio_manager.receive_audio(call_sid, data)
    except WebSocketDisconnect:
        audio_manager.disconnect(call_sid)
