import base64
import json

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from firebase_admin import auth
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models import Call, User

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

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

    await manager.connect(websocket, call_sid)
    try:
        while True:
            await websocket.receive_json()
    # Handle any client messages if needed
    except WebSocketDisconnect:
        manager.disconnect(call_sid)


@router.websocket("/stream")
async def stream_endpoint(ws: WebSocket):
    await ws.accept()
    print("Connection accepted")

    # A lot of messages will be sent rapidly. We'll stop showing after the first one.
    has_seen_media = False
    message_count = 0

    while True:
        try:
            message = await ws.receive_text()
            if message is None:
                print("No message received...")
                continue

            # Messages are a JSON encoded string
            data = json.loads(message)

            # Using the event type you can determine what type of message you are receiving
            if data["event"] == "connected":
                print(f"Connected Message received: {message}")
            elif data["event"] == "start":
                print(f"Start Message received: {message}")
            elif data["event"] == "media":
                if not has_seen_media:
                    print(f"Media message: {message}")
                    payload = data["media"]["payload"]
                    print(f"Payload is: {payload}")
                    chunk = base64.b64decode(payload)
                    print(f"That's {len(chunk)} bytes")
                    print(
                        "Additional media messages from WebSocket are being suppressed...."
                    )
                    has_seen_media = True
            elif data["event"] == "closed":
                print(f"Closed Message received: {message}")
                break
            message_count += 1

        except Exception as e:
            print(f"Error processing message: {str(e)}")
            break

    print(f"Connection closed. Received a total of {message_count} messages")
