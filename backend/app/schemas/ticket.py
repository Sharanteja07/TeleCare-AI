import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from app.schemas.user import UserResponse

SIM_CATEGORIES: List[str] = [
    "SIM Activation",
    "SIM Not Working",
    "SIM Lost",
    "SIM Damaged",
    "SIM Replacement",
    "eSIM Activation",
    "eSIM Not Working",
    "SIM Blocked",
    "SIM PIN / PUK Issue",
    "SIM Registration",
    "SIM Portability",
    "SIM Upgrade",
    "SIM Deactivation",
    "SIM Ownership Transfer",
    "SIM Related Billing",
    "Other SIM Issue"
]

class TicketBase(BaseModel):
    title: str
    description: str
    category: str = "SIM Not Working"
    priority: str = "Medium"  # Low, Medium, High

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    engineer_id: Optional[int] = None
    diagnostics: Optional[dict] = None
    engineer_notes: Optional[str] = None

class TicketAssign(BaseModel):
    engineer_id: int

class TicketStatusUpdate(BaseModel):
    status: str

class TicketNoteUpdate(BaseModel):
    engineer_notes: str

class TicketResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    priority: str
    status: str
    customer_id: int
    engineer_id: Optional[int] = None
    diagnostics: Optional[dict] = None
    engineer_notes: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    customer: Optional[UserResponse] = None
    engineer: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
