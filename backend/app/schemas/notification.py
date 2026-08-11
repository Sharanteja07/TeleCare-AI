import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional

class NotificationBase(BaseModel):
    title: str
    message: str

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
