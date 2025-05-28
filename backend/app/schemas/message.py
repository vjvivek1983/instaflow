from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

class MessageBase(BaseModel):
    direction: str
    type: str
    content: Dict[str, Any]
    is_automated: bool = False

class MessageCreate(MessageBase):
    instagram_account_id: UUID
    contact_id: UUID
    flow_id: Optional[UUID] = None
    conversation_id: Optional[UUID] = None

class MessageUpdate(BaseModel):
    content: Optional[Dict[str, Any]] = None

class MessageResponse(MessageBase):
    id: UUID
    instagram_account_id: UUID
    contact_id: UUID
    flow_id: Optional[UUID] = None
    conversation_id: Optional[UUID] = None
    timestamp: datetime

    class Config:
        from_attributes = True 