import os
import shutil
import uuid

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    HTTPException,
    status
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.attachment import Attachment
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.attachment import AttachmentResponse
from app.auth.dependencies import get_current_user, get_db

router = APIRouter(
    prefix="/tickets",
    tags=["Attachments"]
)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "tickets")

if not os.path.isdir(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".pdf"
}

@router.post(
    "/{ticket_id}/attachments",
    response_model=AttachmentResponse,
    status_code=status.HTTP_201_CREATED
)
def upload_attachment(
    ticket_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    # Role permissions check for upload
    if current_user.role == "customer" and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == "engineer" and ticket.engineer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    filename = file.filename or "file"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PNG, JPG, JPEG and PDF files are allowed."
        )

    unique_name = f"{uuid.uuid4()}{ext}"
    save_path = os.path.join(UPLOAD_FOLDER, unique_name)

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    attachment = Attachment(
        ticket_id=ticket_id,
        uploaded_by=current_user.id,
        file_name=filename,
        file_path=save_path,
        file_type=file.content_type
    )

    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    return attachment


@router.get(
    "/{ticket_id}/attachments",
    response_model=list[AttachmentResponse]
)
def get_attachments(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    if current_user.role == "customer" and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == "engineer" and ticket.engineer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    attachments = (
        db.query(Attachment)
        .filter(Attachment.ticket_id == ticket_id)
        .all()
    )

    return attachments


@router.get(
    "/attachments/{attachment_id}/download"
)
def download_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attachment = (
        db.query(Attachment)
        .filter(Attachment.id == attachment_id)
        .first()
    )

    if not attachment:
        raise HTTPException(
            status_code=404,
            detail="Attachment not found"
        )

    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == attachment.ticket_id)
        .first()
    )

    if current_user.role == "customer" and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == "engineer" and ticket.engineer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    real_path = os.path.realpath(attachment.file_path)
    real_upload_dir = os.path.realpath(UPLOAD_FOLDER)

    if not real_path.startswith(real_upload_dir) or not os.path.exists(real_path):
        raise HTTPException(
            status_code=404,
            detail="File not found on disk"
        )

    return FileResponse(
        path=real_path,
        filename=attachment.file_name,
        media_type=attachment.file_type
    )


@router.delete(
    "/attachments/{attachment_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_attachment(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attachment = (
        db.query(Attachment)
        .filter(Attachment.id == attachment_id)
        .first()
    )

    if not attachment:
        raise HTTPException(
            status_code=404,
            detail="Attachment not found"
        )

    ticket = (
        db.query(Ticket)
        .filter(Ticket.id == attachment.ticket_id)
        .first()
    )

    if current_user.role == "customer" and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == "engineer" and ticket.engineer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    real_path = os.path.realpath(attachment.file_path)
    real_upload_dir = os.path.realpath(UPLOAD_FOLDER)

    if real_path.startswith(real_upload_dir) and os.path.exists(real_path):
        os.remove(real_path)

    db.delete(attachment)
    db.commit()

    return None