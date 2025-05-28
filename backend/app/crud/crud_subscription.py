from typing import List, Optional
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.subscription import SubscriptionPlan
from app.schemas.subscription import SubscriptionPlanCreate, SubscriptionPlanUpdate

class CRUDSubscriptionPlan(CRUDBase[SubscriptionPlan, SubscriptionPlanCreate, SubscriptionPlanUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> Optional[SubscriptionPlan]:
        return db.query(SubscriptionPlan).filter(SubscriptionPlan.name == name).first()

    def get_all(self, db: Session) -> List[SubscriptionPlan]:
        return db.query(SubscriptionPlan).all()

subscription_plan = CRUDSubscriptionPlan(SubscriptionPlan) 