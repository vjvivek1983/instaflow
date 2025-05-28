from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel

# Shared properties
class SubscriptionPlanBase(BaseModel):
    name: str
    description: str
    price_monthly: float
    max_instagram_accounts: int
    max_contacts: int
    max_flows: int
    features: List[str]

# Properties to receive via API on creation
class SubscriptionPlanCreate(SubscriptionPlanBase):
    pass

# Properties to receive via API on update
class SubscriptionPlanUpdate(SubscriptionPlanBase):
    pass

# Properties shared by models stored in DB
class SubscriptionPlanInDBBase(SubscriptionPlanBase):
    id: UUID

    class Config:
        from_attributes = True

# Properties to return to client
class SubscriptionPlan(SubscriptionPlanInDBBase):
    pass

# Properties stored in DB
class SubscriptionPlanInDB(SubscriptionPlanInDBBase):
    pass 