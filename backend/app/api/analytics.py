from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, List, Any
import datetime
from collections import defaultdict

from app.models.ticket import Ticket
from app.models.feedback import Feedback
from app.models.user import User
from app.auth.dependencies import get_db, RoleChecker

router = APIRouter(prefix="/analytics", tags=["Analytics"])

dependency_roles = Depends(RoleChecker(["admin", "engineer"]))

@router.get("/stats", dependencies=[dependency_roles])
def get_stats(db: Session = Depends(get_db)):
    total = db.query(Ticket).count()
    open_count = db.query(Ticket).filter(Ticket.status == "Open").count()
    in_progress = db.query(Ticket).filter(Ticket.status == "In Progress").count()
    resolved = db.query(Ticket).filter(Ticket.status == "Resolved").count()
    closed = db.query(Ticket).filter(Ticket.status == "Closed").count()
    
    return {
        "total_tickets": total,
        "status_counts": {
            "Open": open_count,
            "In Progress": in_progress,
            "Resolved": resolved,
            "Closed": closed
        }
    }

@router.get("/category-report", dependencies=[dependency_roles])
def get_category_report(db: Session = Depends(get_db)):
    results = db.query(Ticket.category, func.count(Ticket.id)).group_by(Ticket.category).all()
    return {category: count for category, count in results}

@router.get("/monthly-report", dependencies=[dependency_roles])
def get_monthly_report(db: Session = Depends(get_db)):
    tickets = db.query(Ticket.created_at).all()
    monthly_counts = defaultdict(int)
    for t in tickets:
        if t.created_at:
            month_str = t.created_at.strftime("%Y-%m")
            monthly_counts[month_str] += 1
            
    sorted_months = sorted(monthly_counts.items())
    return [{"month": m, "count": c} for m, c in sorted_months]

@router.get("/engineer-performance", dependencies=[dependency_roles])
def get_engineer_performance(db: Session = Depends(get_db)):
    engineers = db.query(User).filter(User.role.in_(["engineer", "admin"])).all()
    
    performance_list = []
    for eng in engineers:
        total_assigned = db.query(Ticket).filter(Ticket.engineer_id == eng.id).count()
        resolved_closed = db.query(Ticket).filter(
            Ticket.engineer_id == eng.id,
            Ticket.status.in_(["Resolved", "Closed"])
        ).count()
        
        resolution_rate = 0.0
        if total_assigned > 0:
            resolution_rate = round((resolved_closed / total_assigned) * 100, 2)
            
        avg_rating = db.query(func.avg(Feedback.rating)).join(
            Ticket, Ticket.id == Feedback.ticket_id
        ).filter(Ticket.engineer_id == eng.id).scalar()
        
        performance_list.append({
            "engineer_id": eng.id,
            "username": eng.username,
            "role": eng.role,
            "total_assigned": total_assigned,
            "resolved_or_closed": resolved_closed,
            "resolution_rate_percent": resolution_rate,
            "average_rating": round(float(avg_rating), 2) if avg_rating is not None else 0.0
        })
        
    return performance_list

@router.get("/customer-satisfaction", dependencies=[dependency_roles])
def get_customer_satisfaction(db: Session = Depends(get_db)):
    feedbacks = db.query(Feedback).all()
    if not feedbacks:
        return {
            "average_rating": 0.0,
            "rating_breakdown": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
            "total_reviews": 0,
            "recent_comments": []
        }
        
    total_rating = sum(f.rating for f in feedbacks)
    total_reviews = len(feedbacks)
    avg_rating = round(total_rating / total_reviews, 2)
    
    breakdown = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    recent_comments = []
    
    sorted_feedbacks = sorted(feedbacks, key=lambda x: x.created_at, reverse=True)
    
    for f in sorted_feedbacks:
        breakdown[f.rating] += 1
        if f.comment and len(recent_comments) < 5:
            recent_comments.append({
                "ticket_id": f.ticket_id,
                "rating": f.rating,
                "comment": f.comment,
                "created_at": f.created_at
            })
            
    return {
        "average_rating": avg_rating,
        "rating_breakdown": breakdown,
        "total_reviews": total_reviews,
        "recent_comments": recent_comments
    }
