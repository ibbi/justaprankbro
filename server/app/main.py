import csv
from contextlib import asynccontextmanager

import firebase_admin
import stripe
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from firebase_admin import credentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.api_router import api_router, auth_router
from app.core import database_session
from app.core.config import get_settings
from app.models import Script


@asynccontextmanager
async def lifespan(app: FastAPI):
    csv_file_path = get_settings().preflight.call_script_csv_path
    async with database_session.get_async_session() as session:
        await load_scripts_from_csv(session, csv_file_path)
    yield


app = FastAPI(
    title="Prank Ring",
    version="1.0.0",
    description="Retell prank clal wrapper",
    openapi_url="/openapi.json",
    docs_url="/",
    lifespan=lifespan,
)


app.include_router(auth_router)
app.include_router(api_router)

# Sets all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        str(origin).rstrip("/")
        for origin in get_settings().security.backend_cors_origins
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Guards against HTTP Host Header attacks
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=get_settings().security.allowed_hosts,
)

cred_path = get_settings().firebase.credentials_json_path

cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

stripe.api_key = get_settings().stripe.api_key.get_secret_value()


async def load_scripts_from_csv(session: AsyncSession, csv_file_path: str):
    with open(csv_file_path) as file:
        reader = csv.DictReader(file)
        for row in reader:
            script = Script(
                id=int(row["id"]),
                title=row["title"],
                agent_id=row["agent_id"],
                image=row["image"],
                sample_audio=row["sample_audio"],
                cost=int(row["cost"]),
                fields=eval(row["fields"]),
            )
            await session.merge(script)
    await session.commit()
