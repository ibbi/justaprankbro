import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from retell import Retell
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://ibbi.io"],  # Add your production URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/makecall")
async def make_call(request: Request):
    data = await request.json()
    phone_number = data.get("phone_number")
    agent_id = data.get("agent_id")
    dynamic_vars = data.get("dynamic_vars")
    
    # Get the API key from environment variables
    api_key = os.getenv("RETELL_KEY")

    # Initialize the Retell client
    client = Retell(api_key=api_key)

    # Make the call
    call = client.call.create(
        from_number="+15597447125",
        to_number=phone_number,
        override_agent_id=agent_id,
        retell_llm_dynamic_variables=dynamic_vars,
        drop_call_if_machine_detected=True,
    )

    return JSONResponse(content=call.dict())


@app.get("/getcall/{call_id}")
async def get_call(call_id: str):
    # Get the API key from environment variables
    api_key = os.getenv("RETELL_KEY")

    # Initialize the Retell client
    client = Retell(api_key=api_key)

    # Get the call
    call = client.call.retrieve(call_id=call_id)
    print(call)

    return JSONResponse(content=call.dict())


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("SERVER_HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host=host, port=port)
