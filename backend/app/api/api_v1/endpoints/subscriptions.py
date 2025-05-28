from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.SubscriptionPlan])
def read_subscription_plans(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve subscription plans.
    """
    subscription_plans = crud.subscription_plan.get_multi(db, skip=skip, limit=limit)
    return subscription_plans

@router.post("/", response_model=schemas.SubscriptionPlan)
def create_subscription_plan(
    *,
    db: Session = Depends(deps.get_db),
    subscription_plan_in: schemas.SubscriptionPlanCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new subscription plan.
    """
    subscription_plan = crud.subscription_plan.create(db, obj_in=subscription_plan_in)
    return subscription_plan 