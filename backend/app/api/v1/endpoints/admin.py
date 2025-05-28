from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.core.auth import get_current_admin_user
from app.models.user import User
from app.models.subscription_plan import SubscriptionPlan
from app.schemas.admin import UserResponse, SubscriptionPlanResponse, UserStatusUpdate

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
async def get_users(
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    """Get all users (admin only)."""
    users = db.query(User).all()
    return users

@router.get("/subscription-plans", response_model=List[SubscriptionPlanResponse])
async def get_subscription_plans(
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    """Get all subscription plans (admin only)."""
    plans = db.query(SubscriptionPlan).all()
    return plans

@router.put("/users/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: str,
    status_update: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    """Update a user's status (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.status = status_update.status
    db.commit()
    db.refresh(user)
    return user

@router.post("/subscription-plans", response_model=SubscriptionPlanResponse)
async def create_subscription_plan(
    plan: SubscriptionPlanResponse,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    """Create a new subscription plan (admin only)."""
    db_plan = SubscriptionPlan(**plan.dict())
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.put("/subscription-plans/{plan_id}", response_model=SubscriptionPlanResponse)
async def update_subscription_plan(
    plan_id: str,
    plan_update: SubscriptionPlanResponse,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    """Update a subscription plan (admin only)."""
    db_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")

    for key, value in plan_update.dict(exclude_unset=True).items():
        setattr(db_plan, key, value)

    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.delete("/subscription-plans/{plan_id}")
async def delete_subscription_plan(
    plan_id: str,
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin_user)
):
    """Delete a subscription plan (admin only)."""
    db_plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")

    db.delete(db_plan)
    db.commit()
    return {"message": "Subscription plan deleted"} 