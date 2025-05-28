from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message_log import MessageLog
from app.models.instagram_account import InstagramAccount
from app.schemas.conversation import ConversationCreate, ConversationUpdate, ConversationResponse
from app.schemas.message import MessageCreate, MessageResponse
from app.services.instagram import InstagramService

router = APIRouter()

@router.post("/", response_model=ConversationResponse)
def create_conversation(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    conversation_in: ConversationCreate
) -> Any:
    """
    Create new conversation.
    """
    # Check if user has access to the Instagram account
    account = db.query(InstagramAccount).filter(
        InstagramAccount.id == conversation_in.instagram_account_id,
        InstagramAccount.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instagram account not found",
        )
    
    conversation = Conversation(**conversation_in.dict())
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation

@router.get("/", response_model=List[ConversationResponse])
def read_conversations(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    instagram_account_id: str = None,
    status: str = None
) -> Any:
    """
    Retrieve conversations.
    """
    query = db.query(Conversation).join(InstagramAccount).filter(
        InstagramAccount.user_id == current_user.id
    )
    
    if instagram_account_id:
        query = query.filter(Conversation.instagram_account_id == instagram_account_id)
    
    if status:
        query = query.filter(Conversation.status == status)
    
    conversations = query.order_by(Conversation.updated_at.desc()).offset(skip).limit(limit).all()
    return conversations

@router.get("/{conversation_id}", response_model=ConversationResponse)
def read_conversation(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    conversation_id: str
) -> Any:
    """
    Get conversation by ID.
    """
    conversation = db.query(Conversation).join(InstagramAccount).filter(
        Conversation.id == conversation_id,
        InstagramAccount.user_id == current_user.id
    ).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    return conversation

@router.put("/{conversation_id}", response_model=ConversationResponse)
def update_conversation(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    conversation_id: str,
    conversation_in: ConversationUpdate
) -> Any:
    """
    Update conversation.
    """
    conversation = db.query(Conversation).join(InstagramAccount).filter(
        Conversation.id == conversation_id,
        InstagramAccount.user_id == current_user.id
    ).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    
    for field, value in conversation_in.dict(exclude_unset=True).items():
        setattr(conversation, field, value)
    
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
def read_messages(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    conversation_id: str,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Get messages for a conversation.
    """
    conversation = db.query(Conversation).join(InstagramAccount).filter(
        Conversation.id == conversation_id,
        InstagramAccount.user_id == current_user.id
    ).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    
    messages = db.query(MessageLog).filter(
        MessageLog.conversation_id == conversation_id
    ).order_by(MessageLog.timestamp.desc()).offset(skip).limit(limit).all()
    return messages

@router.post("/{conversation_id}/messages", response_model=MessageResponse)
def create_message(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    conversation_id: str,
    message_in: MessageCreate
) -> Any:
    """
    Send a message in a conversation.
    """
    conversation = db.query(Conversation).join(InstagramAccount).filter(
        Conversation.id == conversation_id,
        InstagramAccount.user_id == current_user.id
    ).first()
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )
    
    # Send message via Instagram API
    instagram_service = InstagramService()
    instagram_service.send_message(
        account=conversation.instagram_account,
        recipient_id=conversation.contact.instagram_user_id,
        message=message_in.content
    )
    
    # Log message
    message = MessageLog(
        conversation_id=conversation_id,
        direction="outbound",
        **message_in.dict()
    )
    db.add(message)
    
    # Update conversation
    conversation.last_message_id = message.id
    conversation.updated_at = message.timestamp
    
    db.commit()
    db.refresh(message)
    return message 