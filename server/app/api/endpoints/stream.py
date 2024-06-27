import base64
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class StreamManager:
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


stream_manager = StreamManager()


@router.websocket("/stream")
async def stream_endpoint(ws: WebSocket):
    print(f"Incoming WebSocket connection from {ws.client.host}")
    print(f"Headers: {ws.headers}")
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

    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print("Error processing message: %s", str(e))
    finally:
        stream_manager.disconnect(connection_id)
        print("Connection closed. Received a total of %d messages", message_count)
