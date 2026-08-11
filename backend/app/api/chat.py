from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import datetime

from app.models.chat import ChatMessage
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse
from app.auth.dependencies import get_current_user, get_db
from app.auth.jwt import decode_access_token
from app.database.database import get_db as get_db_generator

router = APIRouter(prefix="/chat", tags=["Chat"])

def get_or_create_ai_user(db: Session) -> User:
    ai_user = db.query(User).filter(User.username == "AI_Assistant").first()
    if not ai_user:
        ai_user = User(
            username="AI_Assistant",
            email="ai@telecare.com",
            hashed_password="placeholder_no_login",
            role="engineer",
            is_active=True
        )
        db.add(ai_user)
        db.commit()
        db.refresh(ai_user)
    return ai_user

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, ticket_id: int):
        await websocket.accept()
        if ticket_id not in self.active_connections:
            self.active_connections[ticket_id] = []
        self.active_connections[ticket_id].append(websocket)

    def disconnect(self, websocket: WebSocket, ticket_id: int):
        if ticket_id in self.active_connections:
            if websocket in self.active_connections[ticket_id]:
                self.active_connections[ticket_id].remove(websocket)
            if not self.active_connections[ticket_id]:
                del self.active_connections[ticket_id]

    async def broadcast_to_ticket(self, message: dict, ticket_id: int):
        if ticket_id in self.active_connections:
            for connection in self.active_connections[ticket_id]:
                await connection.send_json(message)

manager = ConnectionManager()

def generate_ai_reply(user_msg: str, ticket_title: str) -> str:
    msg_lower = user_msg.lower()
    title_lower = ticket_title.lower()
    combined = f"{msg_lower} {title_lower}"

    # Filter out unrelated broadband / router / wifi queries
    unrelated_keywords = ['wifi', 'wi-fi', 'router', 'broadband', 'fiber', 'internet speed', 'modem', 'laptop', 'printer', 'food', 'weather']
    if any(kw in combined for kw in unrelated_keywords):
        return ("Hi! I am your TeleCare AI Assistant. I specialize exclusively in SIM-related support "
                "(SIM activation, replacement, lost/damaged SIMs, eSIM, PIN/PUK, and mobile network settings). "
                "For non-SIM services, please contact general support.")

    # 15+ SIM telecom topics mapped to automated responses
    topics = {
        ("activation", "activate", "new sim"): "SIM activations usually complete within 2-4 hours. Please restart your phone once to allow the new SIM profile to register on our network.",
        ("esim", "e-sim", "qr code"): "For eSIM activation, ensure your device is connected to Wi-Fi, scan the activation QR code from your email, and select 'Add Cellular Plan'.",
        ("puk", "pin", "blocked"): "If your SIM card is locked due to PIN/PUK attempts, do not guess further. Our support engineer can retrieve your official PUK code safely.",
        ("lost", "stolen", "block"): "For lost or stolen SIM cards, we can help block the physical SIM immediately to prevent unauthorized usage and issue a replacement SIM.",
        ("damaged", "broken", "cracked"): "If your SIM card is physically damaged or not detected by your device, a physical SIM replacement is recommended.",
        ("no sim", "no service", "not working"): "Please turn off your phone, remove the SIM card, wipe the gold contact pins with a dry cloth, reinsert securely, and restart your phone.",
        ("port", "portability", "mnp"): "To port your number to TeleCare AI, SMS PORT <MobileNumber> to 1900 from your current SIM to receive a 8-digit UPC code.",
        ("apn", "data settings", "mobile data"): "To configure APN settings, go to Mobile Networks > Access Point Names, add a new APN with Name 'TeleCare AI' and APN 'internet'. Save and restart.",
        ("volte", "hd voice"): "To enable VoLTE or Wi-Fi Calling, verify that your device software is updated and toggle 'VoLTE Calls' ON in Mobile Data Settings.",
        ("billing", "charge", "balance"): "You can check your SIM balance, active plans, and itemized data charges directly under your profile on the TeleCare AI portal."
    }

    for keywords, response in topics.items():
        if any(kw in combined for kw in keywords):
            return "Hi! I am your TeleCare AI Assistant. " + response

    return ("Hi! I am your TeleCare AI Assistant. I have logged your SIM request. "
            "Our support engineer has been notified and will review your ticket details shortly.")

@router.post("/send", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    chat_in: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == chat_in.ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if current_user.role == "customer" and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    elif current_user.role == "engineer" and ticket.engineer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    db_msg = ChatMessage(
        ticket_id=chat_in.ticket_id,
        sender_id=current_user.id,
        message=chat_in.message,
        created_at=datetime.datetime.now(datetime.timezone.utc)
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)

    # Broadcast user message
    msg_dict = {
        "id": db_msg.id,
        "ticket_id": db_msg.ticket_id,
        "sender_id": db_msg.sender_id,
        "message": db_msg.message,
        "created_at": db_msg.created_at.isoformat(),
        "sender": {"id": current_user.id, "username": current_user.username, "role": current_user.role}
    }
    await manager.broadcast_to_ticket(msg_dict, chat_in.ticket_id)

    if current_user.role == "customer" and ticket.status != "Closed":
        ai_user = get_or_create_ai_user(db)
        ai_reply_text = generate_ai_reply(chat_in.message, ticket.title)
        ai_msg = ChatMessage(
            ticket_id=chat_in.ticket_id,
            sender_id=ai_user.id,
            message=ai_reply_text,
            created_at=datetime.datetime.now(datetime.timezone.utc)
        )
        db.add(ai_msg)
        if ticket.status == "Open":
            ticket.status = "In Progress"
        db.commit()
        db.refresh(ai_msg)

        # Broadcast AI message
        ai_msg_dict = {
            "id": ai_msg.id,
            "ticket_id": ai_msg.ticket_id,
            "sender_id": ai_msg.sender_id,
            "message": ai_msg.message,
            "created_at": ai_msg.created_at.isoformat(),
            "sender": {"id": ai_user.id, "username": ai_user.username, "role": ai_user.role}
        }
        await manager.broadcast_to_ticket(ai_msg_dict, chat_in.ticket_id)

    return db_msg

@router.get("/history/{ticket_id}", response_model=List[ChatMessageResponse])
def get_chat_history(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")

    if current_user.role == "customer" and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    elif current_user.role == "engineer" and ticket.engineer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return db.query(ChatMessage).filter(ChatMessage.ticket_id == ticket_id).order_by(ChatMessage.created_at.asc()).all()

@router.websocket("/ws/{ticket_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    ticket_id: int, 
    token: str = Query(...)
):
    db_gen = get_db_generator()
    db = next(db_gen)

    # Authenticate token
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    if user.role == "customer" and ticket.customer_id != user.id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    elif user.role == "engineer" and ticket.engineer_id != user.id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, ticket_id)
    try:
        while True:
            data = await websocket.receive_text()
            pass
    except WebSocketDisconnect:
        manager.disconnect(websocket, ticket_id)
