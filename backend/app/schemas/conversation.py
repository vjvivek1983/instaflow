from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

class ConversationBase(BaseModel):
    status: str = "open"

class ConversationCreate(ConversationBase):
    instagram_account_id: UUID
    contact_id: UUID
    assigned_agent_id: Optional[UUID] = None

class ConversationUpdate(BaseModel):
    status: Optional[str] = None
    assigned_agent_id: Optional[UUID] = None

class ConversationResponse(ConversationBase):
    id: UUID
    instagram_account_id: UUID
    contact_id: UUID
    assigned_agent_id: Optional[UUID] = None
    last_message_id: Optional[UUID] = None
    started_at: datetime
    closed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 