from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class UserResponse(BaseModel):
    id: str
    email: str
    firstName: str
    lastName: str
    subscriptionPlanId: str
    status: str
    createdAt: datetime

    class Config:
        from_attributes = True

class UserStatusUpdate(BaseModel):
    status: str

class SubscriptionPlanResponse(BaseModel):
    id: str
    name: str
    description: str
    priceMonthly: float
    maxInstagramAccounts: int
    maxContacts: int
    maxFlows: int
    features: List[str]

    class Config:
        from_attributes = True 