from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.db.base_class import Base

class MessageLog(Base):
    __tablename__ = "message_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    instagram_account_id = Column(UUID(as_uuid=True), ForeignKey("instagram_accounts.id"), nullable=False)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id"), nullable=False)
    direction = Column(Enum('inbound', 'outbound', name='message_direction'), nullable=False)
    type = Column(Enum('text', 'image', 'video', 'button_response', 'quick_reply_response', name='message_type'), nullable=False)
    content = Column(JSONB, nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_automated = Column(Boolean, default=False)
    flow_id = Column(UUID(as_uuid=True), ForeignKey("flows.id"))
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"))

    # Relationships
    instagram_account = relationship("InstagramAccount")
    contact = relationship("Contact", back_populates="message_logs")
    flow = relationship("Flow", back_populates="message_logs")
    conversation = relationship("Conversation", back_populates="messages") 