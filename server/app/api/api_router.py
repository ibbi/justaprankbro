from fastapi import APIRouter

from app.api.endpoints import calls, scripts, users

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
