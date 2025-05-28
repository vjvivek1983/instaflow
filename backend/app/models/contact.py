from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, JSON, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.db.base_class import Base

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    instagram_account_id = Column(UUID(as_uuid=True), ForeignKey("instagram_accounts.id"), nullable=False)
    instagram_user_id = Column(String, nullable=False)
    instagram_username = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    profile_picture_url = Column(String)
    last_interaction_at = Column(DateTime)
    current_flow_id = Column(UUID(as_uuid=True), ForeignKey("flows.id"))
    current_flow_step_node_id = Column(String)
    flow_context = Column(JSONB)
    tags = Column(ARRAY(String), default=[])
    custom_attributes = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    instagram_account = relationship("InstagramAccount", back_populates="contacts")
    current_flow = relationship("Flow")
    conversations = relationship("Conversation", back_populates="contact")
    message_logs = relationship("MessageLog", back_populates="contact")

class ConversationStatus(PyEnum):
    OPEN = "open"
    CLOSED = "closed"
    PENDING_HUMAN = "pending_human"

class MessageDirection(PyEnum):
    INBOUND = "inbound"
    OUTBOUND = "outbound"

class MessageType(PyEnum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    BUTTON_RESPONSE = "button_response"
    QUICK_REPLY_RESPONSE = "quick_reply_response"

class MessageLog(Base):
    __tablename__ = "message_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    direction = Column(Enum(MessageDirection), nullable=False)
    type = Column(Enum(MessageType), nullable=False)
    content = Column(JSON, nullable=False)
    is_automated = Column(Boolean, default=False)
    flow_id = Column(UUID(as_uuid=True), ForeignKey("flows.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    flow = relationship("Flow") 