from sqlalchemy import Column, String, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.db.base_class import Base
from app.models.contact import ConversationStatus

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    instagram_account_id = Column(UUID(as_uuid=True), ForeignKey("instagram_accounts.id"), nullable=False)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id"), nullable=False)
    status = Column(Enum(ConversationStatus), nullable=False, default=ConversationStatus.OPEN)
    assigned_agent_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    last_message_id = Column(UUID(as_uuid=True), ForeignKey("message_logs.id"))
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    closed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    instagram_account = relationship("InstagramAccount", back_populates="conversations")
    contact = relationship("Contact", back_populates="conversations")
    assigned_agent = relationship("User")
    messages = relationship("MessageLog", back_populates="conversation")
    last_message = relationship("MessageLog", foreign_keys=[last_message_id]) 