from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.models.user import User
from app.models.ticket import Ticket
from app.schemas.user import UserResponse, UserUpdate, CustomerResponse
from app.auth.dependencies import get_current_user, get_db, RoleChecker

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.phone is not None:
        current_user.phone = user_update.phone
    if user_update.email is not None:
        # Check if email is already taken
        if user_update.email != current_user.email:
            existing_user = db.query(User).filter(User.email == user_update.email).first()
            if existing_user:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        current_user.email = user_update.email
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/customers", response_model=List[CustomerResponse])
def list_customers(
    db: Session = Depends(get_db),
    admin_user: User = Depends(RoleChecker(["admin"]))
):
    customers = db.query(
        User,
        func.count(Ticket.id).label("ticket_count")
    ).outerjoin(Ticket, Ticket.customer_id == User.id).filter(
        User.role == "customer"
    ).group_by(User.id).all()
    
    result = []
    for user, count in customers:
        user_dict = {c.name: getattr(user, c.name) for c in user.__table__.columns}
        user_dict["ticket_count"] = count
        result.append(user_dict)
    
    return result

@router.get("", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(RoleChecker(["admin"]))
):
    return db.query(User).all()

