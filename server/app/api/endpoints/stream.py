import json

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from firebase_admin import auth
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models import Call, User

router = APIRouter()


class ClientSocketManager:
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

    async def send_audio_chunk(self, call_sid: str, chunk: str, type: str):
        if call_sid in self.active_connections:
            await self.active_connections[call_sid].send_json(
                {"based_chunk": chunk, "type": type}
            )


class TwilioSocketManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        connection_id = id(websocket)
        self.active_connections[connection_id] = websocket
        return connection_id

    def disconnect(self, connection_id: str):
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]


twilio_socket_manager = TwilioSocketManager()


@router.websocket("/twilio_inbound")
async def twilio_inbound(ws: WebSocket):
    connection_id = await twilio_socket_manager.connect(ws)

    try:
        while True:
            message = await ws.receive_text()
            if message is None:
                print("No message received...")
                continue

            # Messages are a JSON encoded string
            data = json.loads(message)

            if data["event"] == "start":
                call_sid = data["start"]["callSid"]

            elif data["event"] == "media":
                payload = data["media"]["payload"]
                await client_socket_manager.send_audio_chunk(
                    call_sid, payload, "inbound"
                )
            elif data["event"] == "closed":
                print("Closed Message received: %s", message)
                break
    except HTTPException as e:
        print(f"Authentication failed: {e.detail}")
        await ws.close(code=e.status_code)
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print("Error processing message: %s", str(e))
    finally:
        twilio_socket_manager.disconnect(connection_id)


@router.websocket("/twilio_outbound")
async def twilio_outbound(ws: WebSocket):
    connection_id = await twilio_socket_manager.connect(ws)

    try:
        while True:
            message = await ws.receive_text()
            if message is None:
                print("No message received...")
                continue

            # Messages are a JSON encoded string
            data = json.loads(message)

            if data["event"] == "start":
                call_sid = data["start"]["callSid"]
            elif data["event"] == "media":
                payload = data["media"]["payload"]
                await client_socket_manager.send_audio_chunk(
                    call_sid, payload, "outbound"
                )
            elif data["event"] == "closed":
                print("Closed Message received: %s", message)
                break
    except HTTPException as e:
        print(f"Authentication failed: {e.detail}")
        await ws.close(code=e.status_code)
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print("Error processing message: %s", str(e))
    finally:
        twilio_socket_manager.disconnect(connection_id)


client_socket_manager = ClientSocketManager()


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


@router.websocket("/client/{call_sid}")
async def client_endpoint(
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

    await client_socket_manager.connect(websocket, call_sid)
    try:
        while True:
            await websocket.receive_json()
    # Handle any client messages if needed
    except WebSocketDisconnect:
        client_socket_manager.disconnect(call_sid)
