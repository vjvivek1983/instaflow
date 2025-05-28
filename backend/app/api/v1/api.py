from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, instagram_accounts, flows, contacts, conversations

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(instagram_accounts.router, prefix="/instagram-accounts", tags=["instagram accounts"])
api_router.include_router(flows.router, prefix="/flows", tags=["flows"])
api_router.include_router(contacts.router, prefix="/contacts", tags=["contacts"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["conversations"]) 