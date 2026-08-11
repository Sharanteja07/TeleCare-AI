import datetime
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class FeedbackCreate(BaseModel):
    ticket_id: int
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    ticket_id: int
    customer_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
