from sqlalchemy.orm import Session

from app import crud, schemas
from app.core.config import settings
from app.db import base  # noqa: F401
from app.models.subscription import SubscriptionPlan

def init_db(db: Session) -> None:
    # Create default subscription plans
    plans = [
        {
            "name": "Free",
            "description": "Basic automation for small businesses",
            "price_monthly": 0,
            "max_instagram_accounts": 1,
            "max_contacts": 100,
            "max_flows": 2,
            "features": ["basic_automation", "dm_keyword_triggers"]
        },
        {
            "name": "Pro",
            "description": "Advanced automation for growing businesses",
            "price_monthly": 29.99,
            "max_instagram_accounts": 3,
            "max_contacts": 1000,
            "max_flows": 10,
            "features": ["basic_automation", "dm_keyword_triggers", "comment_triggers", "analytics", "live_chat"]
        },
        {
            "name": "Business",
            "description": "Enterprise-grade automation solution",
            "price_monthly": 99.99,
            "max_instagram_accounts": 10,
            "max_contacts": 10000,
            "max_flows": 50,
            "features": ["basic_automation", "dm_keyword_triggers", "comment_triggers", "analytics", "live_chat", "team_collaboration", "api_access"]
        }
    ]

    for plan_data in plans:
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.name == plan_data["name"]).first()
        if not plan:
            plan = SubscriptionPlan(**plan_data)
            db.add(plan)
    
    db.commit()

    # Create first superuser if it doesn't exist
    user = crud.user.get_by_email(db, email=settings.FIRST_SUPERUSER_EMAIL)
    if not user:
        user_in = schemas.UserCreate(
            email=settings.FIRST_SUPERUSER_EMAIL,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = crud.user.create(db, obj_in=user_in)  # noqa: F841 