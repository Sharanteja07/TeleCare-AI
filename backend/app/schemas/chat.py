import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.user import UserResponse

class ChatMessageCreate(BaseModel):
    ticket_id: int
    message: str

class ChatMessageResponse(BaseModel):
    id: int
    ticket_id: int
    sender_id: int
    message: str
    created_at: datetime.datetime
    sender: UserResponse

    model_config = ConfigDict(from_attributes=True)
