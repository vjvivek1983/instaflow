from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

class InstagramAccountBase(BaseModel):
    instagram_page_id: str
    instagram_user_id: str
    instagram_username: str
    status: str = "connected"

class InstagramAccountCreate(InstagramAccountBase):
    access_token: str
    token_expires_at: datetime

class InstagramAccountUpdate(BaseModel):
    access_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    status: Optional[str] = None

class InstagramAccountResponse(InstagramAccountBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 