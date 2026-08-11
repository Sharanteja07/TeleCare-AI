from app.services.email_service import send_email
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import datetime

from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import (
    TicketCreate,
    TicketUpdate,
    TicketResponse,
    TicketAssign,
    TicketStatusUpdate,
    TicketNoteUpdate,
    SIM_CATEGORIES
)
from app.models.ticket_activity import TicketActivity
from app.schemas.ticket_activity import TicketActivityResponse
from app.auth.dependencies import (
    get_current_user,
    get_db,
    RoleChecker
)

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.post("", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_in: TicketCreate,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    final_customer_id = current_user.id

    if current_user.role in ["admin", "engineer"] and customer_id is not None:
        cust = db.query(User).filter(User.id == customer_id).first()

        if not cust:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found"
            )

        final_customer_id = customer_id

    # Validate SIM Category for customer ticket creation
    if current_user.role == "customer":
        if ticket_in.category not in SIM_CATEGORIES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid category '{ticket_in.category}'. Please select a valid SIM support category."
            )

    db_ticket = Ticket(
        title=ticket_in.title,
        description=ticket_in.description,
        category=ticket_in.category,
        priority=ticket_in.priority,
        status="Open",
        customer_id=final_customer_id
    )

    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    # Send email after ticket creation
    customer = db.query(User).filter(User.id == final_customer_id).first()

    if customer:
        subject = "Ticket Created Successfully"

        body = f"""
    Hello {customer.username},

    Your support ticket has been created successfully.

    Ticket ID: {db_ticket.id}
    Title: {db_ticket.title}
    Category: {db_ticket.category}
    Priority: {db_ticket.priority}
    Status: {db_ticket.status}

    Our support team will review your issue shortly.

    Thank you,
    AI Telecom Customer Support
    """

        try:
            send_email(customer.email, subject, body)
        except Exception as e:
            print("Failed to send ticket creation email notification:", e)
    return db_ticket


@router.get("", response_model=List[TicketResponse])
def get_tickets(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    engineer_id: Optional[int] = Query(None),
    customer_id: Optional[int] = Query(None),

    search: Optional[str] = Query(
        None,
        description="Search in title or description"
    ),

    start_date: Optional[datetime.date] = Query(None),
    end_date: Optional[datetime.date] = Query(None),

    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=500),

    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    query = db.query(Ticket)

    # ==============================================
    # ROLE-BASED ACCESS
    # ==============================================

    if current_user.role == "customer":
        query = query.filter(
            Ticket.customer_id == current_user.id
        )

    elif current_user.role == "engineer":
        query = query.filter(
            Ticket.engineer_id == current_user.id
        )

    elif current_user.role == "admin":
        pass

    else:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    # ==============================================
    # FILTERS
    # ==============================================

    if status:
        query = query.filter(
            Ticket.status == status
        )

    if priority:
        query = query.filter(
            Ticket.priority == priority
        )

    if category:
        query = query.filter(
            Ticket.category == category
        )

    # ==============================================
    # ENGINEER FILTER
    # ==============================================

    if engineer_id is not None:
        if current_user.role != "admin":
            raise HTTPException(
                status_code=403,
                detail="Only admin can filter by engineer"
            )
        query = query.filter(
            Ticket.engineer_id == engineer_id
        )

    # ==============================================
    # CUSTOMER FILTER
    # ==============================================

    if customer_id is not None:
        if current_user.role != "admin":
            raise HTTPException(
                status_code=403,
                detail="Only admin can filter by customer"
            )
        query = query.filter(
            Ticket.customer_id == customer_id
        )

    # ==============================================
    # SEARCH
    # ==============================================

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Ticket.title.ilike(search_term),
                Ticket.description.ilike(search_term)
            )
        )

    # ==============================================
    # DATE FILTER
    # ==============================================

    if start_date:
        start_datetime = datetime.datetime.combine(
            start_date,
            datetime.time.min
        )
        query = query.filter(
            Ticket.created_at >= start_datetime
        )

    if end_date:
        end_datetime = datetime.datetime.combine(
            end_date,
            datetime.time.max
        )
        query = query.filter(
            Ticket.created_at <= end_datetime
        )

    # ==============================================
    # ORDERING & PAGINATION
    # ==============================================

    query = query.order_by(
        Ticket.created_at.desc()
    )

    offset = (page - 1) * limit

    tickets = (
        query
        .offset(offset)
        .limit(limit)
        .all()
    )

    return tickets


@router.get("/{id}", response_model=TicketResponse)
def get_ticket(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    # Customers can only view their own tickets
    if current_user.role == "customer":
        if ticket.customer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    # Engineers can only view assigned tickets
    elif current_user.role == "engineer":
        if ticket.engineer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    return ticket



@router.put("/{id}", response_model=TicketResponse)
def update_ticket(
    id: int,
    ticket_in: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    # Customer permissions
    if current_user.role == "customer":

        if ticket.customer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        if ticket.status in ["Resolved", "Closed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot edit a resolved or closed ticket"
            )

    # Update fields
    if ticket_in.title is not None:
        ticket.title = ticket_in.title

    if ticket_in.description is not None:
        ticket.description = ticket_in.description

    if ticket_in.category is not None:
        ticket.category = ticket_in.category

    if ticket_in.priority is not None:
        ticket.priority = ticket_in.priority

    if ticket_in.diagnostics is not None:
        ticket.diagnostics = ticket_in.diagnostics

    if ticket_in.status is not None:

        if (
            current_user.role == "customer"
            and ticket_in.status not in ["Resolved", "Closed"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Customers can only set status to Resolved or Closed"
            )

        ticket.status = ticket_in.status

    if ticket_in.engineer_id is not None:

        if current_user.role not in ["admin", "engineer"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin or engineer can assign an engineer"
            )

        engineer = db.query(User).filter(
            User.id == ticket_in.engineer_id
        ).first()

        if not engineer or engineer.role not in ["admin", "engineer"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid engineer"
            )

        ticket.engineer_id = ticket_in.engineer_id

    ticket.updated_at = datetime.datetime.now(datetime.timezone.utc)

    db.commit()
    db.refresh(ticket)

    return ticket
@router.put("/{id}/assign", response_model=TicketResponse)
def assign_engineer(
    id: int,
    payload: TicketAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "engineer"]))
):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    # Engineers can assign tickets only to themselves
    if (
        current_user.role == "engineer"
        and payload.engineer_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Engineers can only assign tickets to themselves"
        )

    engineer = (
        db.query(User)
        .filter(User.id == payload.engineer_id)
        .first()
    )

    if not engineer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Engineer not found"
        )

    if engineer.role not in ["admin", "engineer"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected user is not an engineer"
        )

    ticket.engineer_id = payload.engineer_id

    if ticket.status == "Open":
        ticket.status = "In Progress"

    ticket.updated_at = datetime.datetime.now(datetime.timezone.utc)

    db.commit()
    db.refresh(ticket)

    return ticket

@router.put("/{id}/status", response_model=TicketResponse)
def update_ticket_status(
    id: int,
    payload: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    # Customer Rules
    if current_user.role == "customer":

        if ticket.customer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

        if payload.status not in ["Resolved", "Closed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Customers can only resolve or close their own tickets"
            )

    # Engineer Rules
    elif current_user.role == "engineer":

        if ticket.engineer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ticket is not assigned to you"
            )

    ticket.status = payload.status
    ticket.updated_at = datetime.datetime.now(datetime.timezone.utc)

    db.commit()
    db.refresh(ticket)

    return ticket
@router.put("/{id}/close", response_model=TicketResponse)
def close_ticket(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    # Customer can only close their own ticket
    if current_user.role == "customer":
        if ticket.customer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    # Engineer can only close assigned tickets
    elif current_user.role == "engineer":
        if ticket.engineer_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ticket is not assigned to you"
            )

    # Already closed
    if ticket.status == "Closed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket is already closed"
        )

    ticket.status = "Closed"
    ticket.updated_at = datetime.datetime.now(datetime.timezone.utc)

    db.commit()
    db.refresh(ticket)

    return ticket


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin"]))
):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )

    db.delete(ticket)
    db.commit()

    return None

@router.get("/{id}/activities", response_model=List[TicketActivityResponse])
def get_ticket_activities(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if current_user.role == "customer" and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    elif current_user.role == "engineer" and ticket.engineer_id != current_user.id and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    activities = db.query(TicketActivity).filter(TicketActivity.ticket_id == id).order_by(TicketActivity.created_at.desc()).all()
    return activities

@router.put("/{id}/notes", response_model=TicketResponse)
def update_engineer_notes(
    id: int,
    payload: TicketNoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "engineer"]))
):
    ticket = db.query(Ticket).filter(Ticket.id == id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if current_user.role == "engineer" and ticket.engineer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    ticket.engineer_notes = payload.engineer_notes
    ticket.updated_at = datetime.datetime.now(datetime.timezone.utc)
    
    # Also log activity
    activity = TicketActivity(
        ticket_id=ticket.id,
        user_id=current_user.id,
        activity_type="note_added",
        description="Engineer notes updated"
    )
    db.add(activity)

    db.commit()
    db.refresh(ticket)
    return ticket

@router.get("/stats/dashboard")
def ticket_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "engineer"]))
):
    query = db.query(Ticket)

    # Engineers only see their assigned tickets
    if current_user.role == "engineer":
        query = query.filter(Ticket.engineer_id == current_user.id)

    total = query.count()

    open_count = query.filter(Ticket.status == "Open").count()

    in_progress = query.filter(
        Ticket.status == "In Progress"
    ).count()

    resolved = query.filter(
        Ticket.status == "Resolved"
    ).count()

    closed = query.filter(
        Ticket.status == "Closed"
    ).count()

    high_priority = query.filter(
        Ticket.priority == "High"
    ).count()

    medium_priority = query.filter(
        Ticket.priority == "Medium"
    ).count()

    low_priority = query.filter(
        Ticket.priority == "Low"
    ).count()

    return {
        "total_tickets": total,
        "open_tickets": open_count,
        "in_progress": in_progress,
        "resolved": resolved,
        "closed": closed,
        "priority": {
            "high": high_priority,
            "medium": medium_priority,
            "low": low_priority
        }
    }
