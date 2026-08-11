from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, default="Technical")  # Billing, Technical, Network, Account
    priority = Column(String(50), nullable=False, default="Medium")  # Low, Medium, High
    status = Column(String(50), nullable=False, default="Open")  # Open, In Progress, Resolved, Closed
    engineer_notes = Column(Text, nullable=True)
    diagnostics = Column(JSON, nullable=True)
    
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    engineer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    customer = relationship("User", back_populates="tickets_as_customer", foreign_keys=[customer_id])
    engineer = relationship("User", back_populates="tickets_as_engineer", foreign_keys=[engineer_id])
    chat_messages = relationship("ChatMessage", back_populates="ticket", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="ticket", uselist=False, cascade="all, delete-orphan")
