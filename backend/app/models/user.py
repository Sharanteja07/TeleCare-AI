from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="customer")  # customer, engineer, admin
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    # Using string referencing to avoid circular import issues
    tickets_as_customer = relationship("Ticket", back_populates="customer", foreign_keys="Ticket.customer_id")
    tickets_as_engineer = relationship("Ticket", back_populates="engineer", foreign_keys="Ticket.engineer_id")
    chat_messages = relationship("ChatMessage", back_populates="sender")
    feedbacks = relationship("Feedback", back_populates="customer")
