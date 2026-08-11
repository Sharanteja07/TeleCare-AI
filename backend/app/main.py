from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base, SessionLocal
from app.api import auth, users, tickets, chat, feedback, analytics, attachments, notifications
from app.models.user import User
from app.models.password_reset import PasswordReset
from app.models.user_otp import UserOTP
from app.auth.password import get_password_hash, verify_password
from app.models.attachment import Attachment

# Create tables
Base.metadata.create_all(bind=engine)

# Seed database on startup for easy testing
def ensure_seed_user(db, username, email, password, role):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(
            username=username,
            email=email,
            hashed_password=get_password_hash(password),
            role=role,
            is_active=True
        )
        db.add(user)
    else:
        if not verify_password(password, user.hashed_password):
            user.hashed_password = get_password_hash(password)
        user.email = email
        user.role = role
        user.is_active = True


def seed_database():
    db = SessionLocal()
    try:
        ensure_seed_user(db, "admin", "admin@telecom.com", "adminpassword", "admin")
        ensure_seed_user(db, "engineer", "engineer@telecom.com", "engineerpassword", "engineer")
        ensure_seed_user(db, "customer", "customer@telecom.com", "customerpassword", "customer")
        db.commit()
    finally:
        db.close()

seed_database()

def health_check_smtp():
    import logging
    import smtplib
    from app.services.email_service import is_smtp_configured, SMTP_SERVER, SMTP_PORT, EMAIL_ADDRESS, EMAIL_PASSWORD
    
    logger = logging.getLogger("uvicorn")
    
    missing_configs = []
    if not SMTP_SERVER:
        missing_configs.append("SMTP_SERVER")
    if not SMTP_PORT:
        missing_configs.append("SMTP_PORT")
    if not EMAIL_ADDRESS:
        missing_configs.append("EMAIL_ADDRESS")
    if not EMAIL_PASSWORD:
        missing_configs.append("EMAIL_PASSWORD")

    if missing_configs:
        logger.error(f"SMTP Health Check: Missing configuration variables: {', '.join(missing_configs)}")
        return

    if not is_smtp_configured():
        logger.warning(
            "SMTP Health Check: Invalid or placeholder credentials detected. "
            "Emails will NOT be sent. The application will fall back to printing OTPs to the console."
        )
        return

    try:
        logger.info(f"SMTP Test Connection - Server: '{SMTP_SERVER}', Port: {SMTP_PORT}, Username: '{EMAIL_ADDRESS}'")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.quit()
        logger.info("SMTP Connection Successful")
    except Exception as exc:
        logger.error(f"SMTP Connection Failed. Exact Error: {exc}")

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    health_check_smtp()
    yield

app = FastAPI(
    title="AI Telecom Customer Support Portal API",
    description="Backend API for customer support tickets, AI chat assistance, feedback, and analytics.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for smooth frontend integration
import os

ALLOWED_ORIGINS_ENV = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175")
allowed_origins_list = [origin.strip() for origin in ALLOWED_ORIGINS_ENV.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(tickets.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(attachments.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the AI Telecom Customer Support API!",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }
