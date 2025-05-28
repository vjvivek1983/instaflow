from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db
from app.models.instagram_account import InstagramAccount
from app.models.contact import Contact
from app.models.conversation import Conversation
from app.models.message_log import MessageLog
from app.services.automation import AutomationEngine
from app.services.instagram import InstagramService

router = APIRouter()

@router.get("/instagram")
async def verify_webhook(
    mode: str,
    verify_token: str,
    challenge: str
) -> Any:
    """
    Handle Instagram webhook verification.
    """
    if mode != "subscribe" or verify_token != settings.INSTAGRAM_WEBHOOK_VERIFY_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid verification token",
        )
    return int(challenge)

@router.post("/instagram")
async def handle_webhook(
    request: Request,
    db: Session = Depends(get_db)
) -> Any:
    """
    Handle Instagram webhook events.
    """
    payload = await request.json()
    
    # Verify webhook signature
    signature = request.headers.get("X-Hub-Signature")
    if not signature or not verify_signature(payload, signature):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid webhook signature",
        )
    
    for entry in payload.get("entry", []):
        instagram_page_id = entry.get("id")
        account = db.query(InstagramAccount).filter(
            InstagramAccount.instagram_page_id == instagram_page_id
        ).first()
        if not account:
            continue
        
        for messaging in entry.get("messaging", []):
            sender_id = messaging.get("sender", {}).get("id")
            recipient_id = messaging.get("recipient", {}).get("id")
            
            # Get or create contact
            contact = get_or_create_contact(db, account, sender_id)
            
            # Get or create conversation
            conversation = get_or_create_conversation(db, account, contact)
            
            # Process message
            if "message" in messaging:
                handle_message(db, account, contact, conversation, messaging["message"])
            
            # Process postback
            elif "postback" in messaging:
                handle_postback(db, account, contact, conversation, messaging["postback"])
    
    return {"success": True}

def verify_signature(payload: Dict[str, Any], signature: str) -> bool:
    """
    Verify webhook signature using app secret.
    """
    # TODO: Implement signature verification
    return True

def get_or_create_contact(
    db: Session,
    account: InstagramAccount,
    instagram_user_id: str
) -> Contact:
    """
    Get existing contact or create a new one.
    """
    contact = db.query(Contact).filter(
        Contact.instagram_account_id == account.id,
        Contact.instagram_user_id == instagram_user_id
    ).first()
    
    if not contact:
        # Get user profile from Instagram
        instagram_service = InstagramService()
        profile = instagram_service.get_profile(account, instagram_user_id)
        
        contact = Contact(
            instagram_account_id=account.id,
            instagram_user_id=instagram_user_id,
            instagram_username=profile.get("username"),
            first_name=profile.get("name"),
            profile_picture_url=profile.get("profile_pic")
        )
        db.add(contact)
        db.commit()
        db.refresh(contact)
    
    return contact

def get_or_create_conversation(
    db: Session,
    account: InstagramAccount,
    contact: Contact
) -> Conversation:
    """
    Get active conversation or create a new one.
    """
    conversation = db.query(Conversation).filter(
        Conversation.instagram_account_id == account.id,
        Conversation.contact_id == contact.id,
        Conversation.status == "open"
    ).first()
    
    if not conversation:
        conversation = Conversation(
            instagram_account_id=account.id,
            contact_id=contact.id
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
    
    return conversation

def handle_message(
    db: Session,
    account: InstagramAccount,
    contact: Contact,
    conversation: Conversation,
    message: Dict[str, Any]
) -> None:
    """
    Handle incoming message.
    """
    # Log message
    message_log = MessageLog(
        instagram_account_id=account.id,
        contact_id=contact.id,
        conversation_id=conversation.id,
        direction="inbound",
        type="text",
        content={"text": message.get("text", "")},
        timestamp=message.get("timestamp")
    )
    db.add(message_log)
    
    # Update conversation
    conversation.last_message_id = message_log.id
    conversation.updated_at = message_log.timestamp
    
    db.commit()
    
    # Process message with automation engine
    automation_engine = AutomationEngine(db)
    automation_engine.process_message(account, contact, message_log)

def handle_postback(
    db: Session,
    account: InstagramAccount,
    contact: Contact,
    conversation: Conversation,
    postback: Dict[str, Any]
) -> None:
    """
    Handle postback from button click.
    """
    # Log postback as message
    message_log = MessageLog(
        instagram_account_id=account.id,
        contact_id=contact.id,
        conversation_id=conversation.id,
        direction="inbound",
        type="button_response",
        content={"payload": postback.get("payload")},
        timestamp=postback.get("timestamp")
    )
    db.add(message_log)
    
    # Update conversation
    conversation.last_message_id = message_log.id
    conversation.updated_at = message_log.timestamp
    
    db.commit()
    
    # Process postback with automation engine
    automation_engine = AutomationEngine(db)
    automation_engine.process_postback(account, contact, message_log) 