from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.db.base_class import Base

class InstagramAccount(Base):
    __tablename__ = "instagram_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    instagram_page_id = Column(String, unique=True, nullable=False)
    instagram_user_id = Column(String, unique=True, nullable=False)
    instagram_username = Column(String, nullable=False)
    access_token = Column(String, nullable=False)
    token_expires_at = Column(DateTime, nullable=False)
    status = Column(Enum('connected', 'disconnected', 'error', name='account_status'), default='connected')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="instagram_accounts")
    flows = relationship("Flow", back_populates="instagram_account")
    contacts = relationship("Contact", back_populates="instagram_account")
    conversations = relationship("Conversation", back_populates="instagram_account") 