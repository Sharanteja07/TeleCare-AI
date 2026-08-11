import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional

class TicketActivityBase(BaseModel):
    activity_type: str
    description: str

class TicketActivityCreate(TicketActivityBase):
    ticket_id: int
    user_id: Optional[int] = None

class TicketActivityResponse(TicketActivityBase):
    id: int
    ticket_id: int
    user_id: Optional[int] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
