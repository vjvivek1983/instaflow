from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, UUID4
from app.models.contact import ConversationStatus, MessageDirection, MessageType
from app.schemas.base import IDSchema, TimestampedSchema
from uuid import UUID

class ContactBase(BaseModel):
    instagram_user_id: str
    instagram_username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_picture_url: Optional[str] = None
    tags: List[str] = []
    custom_attributes: Dict[str, Any] = {}

class ContactCreate(ContactBase):
    instagram_account_id: UUID4

class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_picture_url: Optional[str] = None
    tags: Optional[List[str]] = None
    custom_attributes: Optional[Dict[str, Any]] = None

class ContactInDBBase(ContactBase, IDSchema, TimestampedSchema):
    instagram_account_id: UUID4
    last_interaction_at: Optional[datetime] = None
    current_flow_id: Optional[UUID4] = None
    current_flow_step_node_id: Optional[str] = None
    flow_context: Optional[Dict[str, Any]] = None

class Contact(ContactInDBBase):
    pass

class ContactResponse(ContactInDBBase):
    pass

class ConversationBase(BaseModel):
    status: ConversationStatus = ConversationStatus.OPEN

class ConversationCreate(ConversationBase):
    instagram_account_id: UUID4
    contact_id: UUID4
    assigned_agent_id: Optional[UUID4] = None

class ConversationUpdate(BaseModel):
    status: Optional[ConversationStatus] = None
    assigned_agent_id: Optional[UUID4] = None

class ConversationInDBBase(ConversationBase, IDSchema, TimestampedSchema):
    instagram_account_id: UUID4
    contact_id: UUID4
    assigned_agent_id: Optional[UUID4] = None
    started_at: datetime
    closed_at: Optional[datetime] = None

class Conversation(ConversationInDBBase):
    pass

class ConversationResponse(ConversationInDBBase):
    pass

class MessageBase(BaseModel):
    direction: MessageDirection
    type: MessageType
    content: Dict[str, Any]
    is_automated: bool = False

class MessageCreate(MessageBase):
    conversation_id: UUID4
    flow_id: Optional[UUID4] = None

class MessageInDBBase(MessageBase, IDSchema):
    conversation_id: UUID4
    flow_id: Optional[UUID4] = None
    timestamp: datetime

class Message(MessageInDBBase):
    pass

class MessageResponse(MessageInDBBase):
    pass

class ConversationWithMessages(Conversation):
    messages: List[Message]
    contact: Contact 