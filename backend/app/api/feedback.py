from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime

from app.models.feedback import Feedback
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.auth.dependencies import get_current_user, get_db, RoleChecker

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    feedback_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == feedback_in.ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
        
    if ticket.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only submit feedback for your own tickets")
        
    if ticket.status not in ["Resolved", "Closed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback can only be submitted for Resolved or Closed tickets"
        )
        
    existing_feedback = db.query(Feedback).filter(Feedback.ticket_id == feedback_in.ticket_id).first()
    if existing_feedback:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Feedback has already been submitted for this ticket"
        )
        
    db_feedback = Feedback(
        ticket_id=feedback_in.ticket_id,
        customer_id=current_user.id,
        rating=feedback_in.rating,
        comment=feedback_in.comment,
        created_at=datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

@router.get("/{ticket_id}", response_model=FeedbackResponse)
def get_feedback(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    feedback = db.query(Feedback).filter(Feedback.ticket_id == ticket_id).first()
    if not feedback:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
        
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if current_user.role == "customer" and feedback.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    elif current_user.role == "engineer" and ticket and ticket.engineer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return feedback

@router.get("", response_model=List[FeedbackResponse])
def get_all_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "engineer"]))
):
    return db.query(Feedback).all()
