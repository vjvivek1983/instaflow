from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.contact import Contact
from app.models.instagram_account import InstagramAccount
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse
from app.services.instagram import InstagramService

router = APIRouter()

@router.post("/", response_model=ContactResponse)
def create_contact(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    contact_in: ContactCreate
) -> Any:
    """
    Create new contact.
    """
    # Check if user has access to the Instagram account
    account = db.query(InstagramAccount).filter(
        InstagramAccount.id == contact_in.instagram_account_id,
        InstagramAccount.user_id == current_user.id
    ).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Instagram account not found",
        )
    
    # Check if contact already exists
    if db.query(Contact).filter(
        Contact.instagram_user_id == contact_in.instagram_user_id,
        Contact.instagram_account_id == contact_in.instagram_account_id
    ).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact already exists",
        )
    
    # Get contact profile from Instagram
    instagram_service = InstagramService()
    profile = instagram_service.get_profile(account, contact_in.instagram_user_id)
    
    contact = Contact(
        **contact_in.dict(),
        first_name=profile.get("name"),
        profile_picture_url=profile.get("profile_pic")
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact

@router.get("/", response_model=List[ContactResponse])
def read_contacts(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
    instagram_account_id: str = None,
    tag: str = None
) -> Any:
    """
    Retrieve contacts.
    """
    query = db.query(Contact).join(InstagramAccount).filter(
        InstagramAccount.user_id == current_user.id
    )
    
    if instagram_account_id:
        query = query.filter(Contact.instagram_account_id == instagram_account_id)
    
    if tag:
        query = query.filter(Contact.tags.contains([tag]))
    
    contacts = query.offset(skip).limit(limit).all()
    return contacts

@router.get("/{contact_id}", response_model=ContactResponse)
def read_contact(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    contact_id: str
) -> Any:
    """
    Get contact by ID.
    """
    contact = db.query(Contact).join(InstagramAccount).filter(
        Contact.id == contact_id,
        InstagramAccount.user_id == current_user.id
    ).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )
    return contact

@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    contact_id: str,
    contact_in: ContactUpdate
) -> Any:
    """
    Update contact.
    """
    contact = db.query(Contact).join(InstagramAccount).filter(
        Contact.id == contact_id,
        InstagramAccount.user_id == current_user.id
    ).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )
    
    for field, value in contact_in.dict(exclude_unset=True).items():
        if field == "tags" and value is not None:
            # Merge existing tags with new ones
            current_tags = set(contact.tags)
            current_tags.update(value)
            value = list(current_tags)
        elif field == "custom_attributes" and value is not None:
            # Merge existing custom attributes with new ones
            contact.custom_attributes.update(value)
            continue
        setattr(contact, field, value)
    
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact

@router.delete("/{contact_id}")
def delete_contact(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    contact_id: str
) -> Any:
    """
    Delete contact.
    """
    contact = db.query(Contact).join(InstagramAccount).filter(
        Contact.id == contact_id,
        InstagramAccount.user_id == current_user.id
    ).first()
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )
    
    db.delete(contact)
    db.commit()
    return {"message": "Contact deleted successfully"} 