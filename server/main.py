import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from retell import Retell
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app runs on port 3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}

@app.post("/items/")
def create_item(item: dict):
    return {"item_name": item["name"], "item_price": item["price"]}

@app.post("/makecall")
async def make_call(request: Request):
    data = await request.json()
    phone_number = data.get("phone_number")
    
    # Get the API key from environment variables
    api_key = os.getenv("RETELL_KEY")

    # Initialize the Retell client
    client = Retell(api_key=api_key)

    # Make the call
    call = client.call.create(
        from_number="+15597447125",
        to_number=phone_number,
        override_agent_id="daae6c86de24a7a92542895c754fc2ac"
    )

    # Print the agent ID (for debugging purposes)
    print(call.agent_id)

    # Return the phone number and agent ID as the response
    return {"phone_number": phone_number, "agent_id": call.agent_id}
