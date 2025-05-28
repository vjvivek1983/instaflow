from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.analytics_service import analytics_service
from app.core.auth import get_current_user
from app.schemas.analytics import AccountSummary, FlowAnalytics, ContactGrowth

router = APIRouter()

@router.get("/instagram-accounts/{instagram_account_id}/analytics/summary", response_model=AccountSummary)
async def get_account_summary(
    instagram_account_id: str,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get analytics summary for an Instagram account."""
    try:
        return await analytics_service.get_account_summary(
            db=db,
            instagram_account_id=instagram_account_id,
            start_date=start_date,
            end_date=end_date
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/flows/{flow_id}/analytics", response_model=FlowAnalytics)
async def get_flow_analytics(
    flow_id: str,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get detailed analytics for a specific flow."""
    try:
        return await analytics_service.get_flow_analytics(
            db=db,
            flow_id=flow_id,
            start_date=start_date,
            end_date=end_date
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/instagram-accounts/{instagram_account_id}/analytics/growth", response_model=List[ContactGrowth])
async def get_contact_growth(
    instagram_account_id: str,
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get contact growth over time."""
    try:
        return await analytics_service.get_contact_growth(
            db=db,
            instagram_account_id=instagram_account_id,
            days=days
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 