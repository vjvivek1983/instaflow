from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.db.base_class import Base

class FlowStatus(PyEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"

class Flow(Base):
    __tablename__ = "flows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    instagram_account_id = Column(UUID(as_uuid=True), ForeignKey("instagram_accounts.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    flow_definition = Column(JSONB, nullable=False)
    status = Column(Enum(FlowStatus), nullable=False, default=FlowStatus.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    instagram_account = relationship("InstagramAccount", back_populates="flows")
    triggers = relationship("Trigger", back_populates="flow")
    message_logs = relationship("MessageLog", back_populates="flow")

class TriggerType(PyEnum):
    WELCOME_MESSAGE = "welcome_message"
    DM_KEYWORD = "dm_keyword"
    COMMENT_KEYWORD = "comment_keyword"
    STORY_MENTION = "story_mention"

class Trigger(Base):
    __tablename__ = "triggers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    flow_id = Column(UUID(as_uuid=True), ForeignKey("flows.id"), nullable=False)
    type = Column(Enum(TriggerType), nullable=False)
    keyword = Column(String)  # For keyword-based triggers
    post_permalink = Column(String)  # For comment triggers on specific posts
    status = Column(Enum(FlowStatus), nullable=False, default=FlowStatus.ACTIVE)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    flow = relationship("Flow", back_populates="triggers") 