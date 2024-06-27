from fastapi import APIRouter

from app.api.endpoints import calls, pay, scripts, status, stream, users, webhooks

auth_router = APIRouter()

api_router = APIRouter(
    responses={
        401: {
            "description": "No `Authorization` access token header, token is invalid or user removed",
            "content": {
                "application/json": {
                    "examples": {
                        "not authenticated": {
                            "summary": "No authorization token header",
                            "value": {"detail": "Not authenticated"},
                        },
                    }
                }
            },
        },
    }
)
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(scripts.router, prefix="/scripts", tags=["scripts"])
api_router.include_router(calls.router, prefix="/calls", tags=["calls"])
api_router.include_router(pay.router, prefix="/pay", tags=["pay"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(status.router, prefix="/status", tags=["status"])
api_router.include_router(stream.router, prefix="/stream", tags=["stream"])
