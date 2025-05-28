from sqlalchemy import Column, String, Float, Integer, ARRAY
from app.db.base_class import Base
from uuid import uuid4

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    price_monthly = Column(Float, nullable=False)
    max_instagram_accounts = Column(Integer, nullable=False)
    max_contacts = Column(Integer, nullable=False)
    max_flows = Column(Integer, nullable=False)
    features = Column(ARRAY(String), nullable=False) 