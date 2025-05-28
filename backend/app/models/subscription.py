from datetime import datetime
from uuid import uuid4
from sqlalchemy import Column, String, Float, Integer, ARRAY, UUID, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(UUID, primary_key=True, default=uuid4)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    price_monthly = Column(Float)
    max_instagram_accounts = Column(Integer)
    max_contacts = Column(Integer)
    max_flows = Column(Integer)
    features = Column(ARRAY(String))

    # Relationships
    subscriptions = relationship("UserSubscription", back_populates="plan")

class UserSubscription(Base):
    __tablename__ = "user_subscriptions"

    id = Column(UUID, primary_key=True, default=uuid4)
    user_id = Column(UUID, ForeignKey("users.id"))
    plan_id = Column(UUID, ForeignKey("subscription_plans.id"))
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="subscriptions")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions") 