import base64
import json

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from twilio.request_validator import RequestValidator

from app.core.config import get_settings

router = APIRouter()


class StreamManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket):
        print("connectingrun")
        await websocket.accept()
        connection_id = id(websocket)
        self.active_connections[connection_id] = websocket
        return connection_id

    def disconnect(self, connection_id: str):
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]


stream_manager = StreamManager()


async def validate_twilio_request(websocket: WebSocket):
    settings = get_settings()
    validator = RequestValidator(settings.twilio.auth_token.get_secret_value())

    # Get the full URL of the WebSocket connection
    url = str(websocket.url)

    # Get the X-Twilio-Signature header
    signature = websocket.headers.get("X-Twilio-Signature", "")

    params = dict(websocket.query_params)
    print("trying to val")
    if not validator.validate(url, params, signature):
        await websocket.close(code=4003)
        return False
    return True


@router.websocket("/")
async def stream_endpoint(ws: WebSocket):
    print("running endpoint")
    await validate_twilio_request(ws)
    connection_id = await stream_manager.connect(ws)
    print("Connection accepted")

    has_seen_media = False
    message_count = 0

    try:
        while True:
            message = await ws.receive_text()
            if message is None:
                print("No message received...")
                continue

            # Messages are a JSON encoded string
            data = json.loads(message)

            # Using the event type you can determine what type of message you are receiving
            if data["event"] == "connected":
                print("Connected Message received: %s", message)
            elif data["event"] == "start":
                print("Start Message received: %s", message)
            elif data["event"] == "media":
                if not has_seen_media:
                    print("Media message: %s", message)
                    payload = data["media"]["payload"]
                    print("Payload is: %s", payload)
                    chunk = base64.b64decode(payload)
                    print("That's %d bytes", len(chunk))
                    print(
                        "Additional media messages from WebSocket are being suppressed...."
                    )
                    has_seen_media = True
            elif data["event"] == "closed":
                print("Closed Message received: %s", message)
                break
            message_count += 1
    except HTTPException as e:
        print(f"Authentication failed: {e.detail}")
        await ws.close(code=e.status_code)
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print("Error processing message: %s", str(e))
    finally:
        stream_manager.disconnect(connection_id)
        print("Connection closed. Received a total of %d messages", message_count)
