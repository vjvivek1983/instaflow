from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.flow import Flow, Trigger
from app.models.instagram_account import InstagramAccount
from app.schemas.flow import (
    FlowCreate,
    FlowUpdate,
    FlowResponse,
    TriggerCreate,
    TriggerUpdate,
    TriggerResponse
)

router = APIRouter()

@router.post("/", response_model=FlowResponse)
def create_flow(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    flow_in: FlowCreate
) -> Any:
    """
    Create new flow.
    """
    # Check if user has access to the Instagram account
    account = db.query(InstagramAccount).filter(
        InstagramAccount.id == flow_in.instagram_account_id,
        InstagramAccount.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instagram account not found",
        )
    
    flow = Flow(**flow_in.dict())
    db.add(flow)
    db.commit()
    db.refresh(flow)
    return flow

@router.get("/", response_model=List[FlowResponse])
def read_flows(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve flows.
    """
    flows = db.query(Flow).join(InstagramAccount).filter(
        InstagramAccount.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    return flows

@router.get("/{flow_id}", response_model=FlowResponse)
def read_flow(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    flow_id: str
) -> Any:
    """
    Get flow by ID.
    """
    flow = db.query(Flow).join(InstagramAccount).filter(
        Flow.id == flow_id,
        InstagramAccount.user_id == current_user.id
    ).first()
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow not found",
        )
    return flow

@router.put("/{flow_id}", response_model=FlowResponse)
def update_flow(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    flow_id: str,
    flow_in: FlowUpdate
) -> Any:
    """
    Update flow.
    """
    flow = db.query(Flow).join(InstagramAccount).filter(
        Flow.id == flow_id,
        InstagramAccount.user_id == current_user.id
    ).first()
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow not found",
        )
    
    for field, value in flow_in.dict(exclude_unset=True).items():
        setattr(flow, field, value)
    
    db.add(flow)
    db.commit()
    db.refresh(flow)
    return flow

@router.delete("/{flow_id}")
def delete_flow(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    flow_id: str
) -> Any:
    """
    Delete flow.
    """
    flow = db.query(Flow).join(InstagramAccount).filter(
        Flow.id == flow_id,
        InstagramAccount.user_id == current_user.id
    ).first()
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow not found",
        )
    
    db.delete(flow)
    db.commit()
    return {"message": "Flow deleted successfully"}

# Trigger endpoints
@router.post("/{flow_id}/triggers", response_model=TriggerResponse)
def create_trigger(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    flow_id: str,
    trigger_in: TriggerCreate
) -> Any:
    """
    Create new trigger for a flow.
    """
    flow = db.query(Flow).join(InstagramAccount).filter(
        Flow.id == flow_id,
        InstagramAccount.user_id == current_user.id
    ).first()
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow not found",
        )
    
    trigger = Trigger(flow_id=flow_id, **trigger_in.dict())
    db.add(trigger)
    db.commit()
    db.refresh(trigger)
    return trigger

@router.get("/{flow_id}/triggers", response_model=List[TriggerResponse])
def read_triggers(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    flow_id: str
) -> Any:
    """
    Get all triggers for a flow.
    """
    flow = db.query(Flow).join(InstagramAccount).filter(
        Flow.id == flow_id,
        InstagramAccount.user_id == current_user.id
    ).first()
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flow not found",
        )
    
    return flow.triggers 