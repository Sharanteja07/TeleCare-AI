import os
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.password import get_password_hash, verify_password
from app.auth.jwt import create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.auth.dependencies import get_db

from app.services.email_service import send_email, EMAIL_ADDRESS, EMAIL_PASSWORD
from app.models.password_reset import PasswordReset
from app.schemas.password_reset import PasswordResetRequest, PasswordResetConfirm
from datetime import datetime, timedelta, timezone
import secrets

# Additional imports for Email OTP system
import time
import re
import logging
from collections import defaultdict
from app.models.user_otp import UserOTP
from app.schemas.otp import OTPSendRequest, OTPVerifyRequest

logger = logging.getLogger("uvicorn")

# Simple in-memory IP rate limiter: mapping client_ip -> list of timestamps
IP_REQUESTS = defaultdict(list)
IP_LIMIT_WINDOW = 3600  # 1 hour
IP_LIMIT_MAX = 20  # max 20 requests per IP per hour

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if username or email already exists
    existing_user = db.query(User).filter((User.username == user_in.username) | (User.email == user_in.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password,
        role=user_in.role or "customer"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Authenticate by username or email
    user = db.query(User).filter(
        (User.username == form_data.username) | (User.email == form_data.username)
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    access_token = create_access_token(
        data={"sub": user.username, "role": user.role, "user_id": user.id}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/otp/send")
def send_otp(
    payload: OTPSendRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    # 1. IP-based rate limiting
    client_ip = request.client.host
    now_ts = time.time()
    IP_REQUESTS[client_ip] = [ts for ts in IP_REQUESTS[client_ip] if now_ts - ts < IP_LIMIT_WINDOW]
    if len(IP_REQUESTS[client_ip]) >= IP_LIMIT_MAX:
        logger.warning(f"Rate-limit event: IP {client_ip} exceeded max OTP requests.")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests from this IP. Please try again later."
        )
    IP_REQUESTS[client_ip].append(now_ts)

    # 2. Email-based rate limiting (60-second cooldown)
    email = payload.email.strip().lower()
    existing_record = db.query(UserOTP).filter(UserOTP.email == email).first()
    
    if existing_record:
        last_sent = existing_record.last_sent_at
        if last_sent.tzinfo is None:
            last_sent = last_sent.replace(tzinfo=timezone.utc)
        
        time_elapsed = datetime.now(timezone.utc) - last_sent
        if time_elapsed.total_seconds() < 60:
            logger.warning(f"Rate-limit event: Email {email} requested OTP within 60s cooldown window.")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Please wait 60 seconds before requesting another OTP."
            )

    # 3. Generate secure 6-digit numeric OTP code
    otp_code = f"{secrets.randbelow(900000) + 100000}"
    hashed_otp = get_password_hash(otp_code)
    expires = datetime.now(timezone.utc) + timedelta(minutes=5)
    logger.info(f"OTP generated: 6-digit OTP code created for {email}")

    # 4. Save/Update record in database
    if existing_record:
        existing_record.hashed_otp = hashed_otp
        existing_record.expires_at = expires
        existing_record.attempts = 0
        existing_record.last_sent_at = datetime.now(timezone.utc)
        existing_record.created_at = datetime.now(timezone.utc)
    else:
        new_otp = UserOTP(
            email=email,
            hashed_otp=hashed_otp,
            expires_at=expires,
            attempts=0,
            last_sent_at=datetime.now(timezone.utc),
            created_at=datetime.now(timezone.utc)
        )
        db.add(new_otp)
    
    db.commit()
    logger.info(f"OTP stored: Hashed OTP stored in database for {email} with 5-minute expiry.")

    from app.services.email_service import is_smtp_configured, send_email, FROM_EMAIL
    
    # Required request details logging
    logger.info(f"OTP Request Detail - Email entered by user: '{payload.email}'")
    logger.info(f"OTP Backend Detail - Email received by backend: '{email}'")
    logger.info(f"OTP Resend Detail - Email passed to Resend API: '{email}', Sender: '{FROM_EMAIL}'")
    
    if not is_smtp_configured():
        logger.error(f"Email send failure with the exact error: SMTP configuration is missing or invalid for {email}.")
    # 6. Send Professional HTML Email
    subject = "🔐 AI Telecom Support Portal - Verification Code"
    body_html = f"""
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Telecom Verification Code</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; padding: 0; background-color: transparent;">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05); overflow: hidden; border: 1px solid #e5e7eb;">
                <!-- Blue Gradient Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%); padding: 40px 0; text-align: center;">
                    <!-- Logo Placeholder -->
                    <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 12px auto;">
                      <tr>
                        <td style="background-color: rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 6px 14px;">
                          <span style="color: #ffffff; font-weight: 700; font-size: 16px; letter-spacing: 1.5px; font-family: 'Inter', sans-serif;">AI TELECOM</span>
                        </td>
                      </tr>
                    </table>
                    <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 0.5px; font-family: 'Inter', sans-serif;">Support Portal</h1>
                  </td>
                </tr>
                <!-- Content Card Body -->
                <tr>
                  <td style="padding: 40px 32px; background-color: #ffffff;">
                    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #1f2937; font-weight: 600; font-family: 'Inter', sans-serif;">Hello,</p>
                    <p style="margin: 0 0 8px 0; font-size: 15px; line-height: 24px; color: #4b5563; font-family: 'Inter', sans-serif;">Welcome to AI Telecom Support Portal.</p>
                    <p style="margin: 0 0 32px 0; font-size: 15px; line-height: 24px; color: #4b5563; font-family: 'Inter', sans-serif;">Use the following One-Time Password (OTP) to continue your login or registration.</p>
                    
                    <!-- Divider -->
                    <div style="border-top: 1px solid #e5e7eb; margin-bottom: 28px;"></div>
                    
                    <!-- Large OTP Box -->
                    <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 28px auto; width: 100%; max-width: 280px;">
                      <tr>
                        <td align="center" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px 0;">
                          <span style="font-family: 'Inter', -apple-system, sans-serif; font-size: 38px; font-weight: 800; letter-spacing: 6px; color: #1e3a8a; display: block; text-align: center; line-height: 1;">{otp_code}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Divider -->
                    <div style="border-top: 1px solid #e5e7eb; margin-bottom: 28px;"></div>

                    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 20px; color: #4b5563; font-weight: 500; font-family: 'Inter', sans-serif;">This verification code will expire in 5 minutes.</p>
                    
                    <!-- Security Guidelines Card -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #f3f4f6;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: #374151; font-family: 'Inter', sans-serif;">For your security:</p>
                          <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 20px; color: #6b7280; font-family: 'Inter', sans-serif;">
                            <li style="margin-bottom: 4px;">Do not share this OTP with anyone.</li>
                            <li style="margin-bottom: 4px;">AI Telecom Support Portal will never ask for your OTP.</li>
                            <li>If you didn't request this OTP, you can safely ignore this email.</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer area -->
                <tr>
                  <td style="padding: 32px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
                    <p style="margin: 0 0 6px 0; font-size: 13px; color: #4b5563; font-weight: 600; font-family: 'Inter', sans-serif;">Need help?</p>
                    <p style="margin: 0 0 24px 0; font-size: 13px; font-family: 'Inter', sans-serif;">
                      <a href="mailto:servicestelecom10@gmail.com" style="color: #2563EB; text-decoration: none; font-weight: 500;">📧 servicestelecom10@gmail.com</a>
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 13px; color: #4b5563; font-weight: 500; font-family: 'Inter', sans-serif;">Thank you,</p>
                    <p style="margin: 0 0 24px 0; font-size: 13px; color: #4b5563; font-weight: 600; font-family: 'Inter', sans-serif;">AI Telecom Support Team</p>
                    <p style="margin: 0 0 4px 0; font-size: 11px; color: #9ca3af; font-family: 'Inter', sans-serif;">&copy; 2025 AI Telecom Support Portal</p>
                    <p style="margin: 0; font-size: 11px; color: #9ca3af; font-family: 'Inter', sans-serif;">All Rights Reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

    try:
        logger.info(f"Requested Email: {payload.email}")
        logger.info(f"Backend Received: {email}")
        logger.info(f"Recipient Sent To: {email}")

        send_email(email, subject, body_html, is_html=True)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Email delivery failed: {exc}"
        )

    return {"message": "OTP sent successfully."}


@router.post("/otp/verify")
def verify_otp(
    payload: OTPVerifyRequest,
    db: Session = Depends(get_db)
):
    email = payload.email.strip().lower()
    code = payload.code.strip()
    role = payload.role.strip()

    # 1. Lookup the OTP record
    record = db.query(UserOTP).filter(UserOTP.email == email).first()
    if not record:
        logger.warning(f"OTP Verification Failure: No OTP record found for {email}.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired. Please request a new one."
        )

    # 2. Check expiration (5 minutes)
    expires_at = record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        logger.warning(f"OTP Verification Failure: Code expired for {email}.")
        db.delete(record)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired. Please request a new one."
        )

    # 3. Verify OTP code
    if not verify_password(code, record.hashed_otp):
        record.attempts += 1
        db.commit()
        logger.warning(f"OTP Verification Failure: Incorrect OTP code for {email}. Attempt: {record.attempts}.")
        
        if record.attempts >= 5:
            db.delete(record)
            db.commit()
            logger.warning(f"OTP Verification Failure: Too many failed attempts for {email}.")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Too many failed attempts. Please request a new OTP."
            )
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP."
        )

    # 4. OTP is correct! Delete record from database
    db.delete(record)
    db.commit()
    logger.info(f"OTP Verification Success: User '{email}' validated successfully.")

    # 5. Check if user exists. If not, auto-register them!
    user = db.query(User).filter(User.email == email).first()
    if not user:
        base_username = email.split("@")[0]
        base_username = re.sub(r"[^a-zA-Z0-9_]", "_", base_username)
        username = base_username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}_{counter}"
            counter += 1

        import uuid
        random_password = get_password_hash(uuid.uuid4().hex)
        user = User(
            username=username,
            email=email,
            hashed_password=random_password,
            role=role,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"Auto-registration: Created new user {username} with role {role} via OTP verify.")

    # 6. Update last_login
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    # 7. Generate access and refresh tokens
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role, "user_id": user.id}
    )
    refresh_token = create_access_token(
        data={"sub": user.username, "role": user.role, "user_id": user.id, "type": "refresh"},
        expires_delta=timedelta(days=7)
    )

    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "is_active": user.is_active
    }

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_data
    }


@router.post("/forgot")
def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    # Always return success to avoid leaking whether the email exists
    if not user:
        return {"message": "If that email exists, a reset key has been sent."}

    # Delete any existing password reset tokens for this user to avoid stale records/constraint errors
    db.query(PasswordReset).filter(PasswordReset.user_id == user.id).delete()
    db.commit()

    # Generate 6-digit numeric OTP code
    token = f"{secrets.randbelow(900000) + 100000}"
    expires = datetime.now(timezone.utc) + timedelta(minutes=30)
    pr = PasswordReset(user_id=user.id, token=token, expires_at=expires)
    db.add(pr)
    db.commit()

    subject = "Password Reset OTP"
    body = (
        f"Your Password Reset OTP is: {token}\n\n"
        f"This OTP expires in 30 minutes (at {expires.isoformat()} UTC).\n\n"
        "Use this code to reset your password in the application."
    )

    from app.services.email_service import is_smtp_configured, FROM_EMAIL
    email_sent = False
    if is_smtp_configured():
        try:
            logger.info(f"Requested Email: {user.email}")
            logger.info(f"Backend Received: {user.email}")
            logger.info(f"Recipient Sent To: {user.email}")

            logger.info(f"Resend Send Request (Password Reset): Sending email from '{FROM_EMAIL}' to '{user.email}'")
            send_email(user.email, subject, body)
            email_sent = True
            logger.info(f"Resend Send Success (Password Reset): Email successfully delivered from '{FROM_EMAIL}' to '{user.email}'")
        except Exception as exc:
            logger.error(f"Resend Send Failure (Password Reset): Failed to deliver email from '{FROM_EMAIL}' to '{user.email}'. Error: {exc}")

    response = {
        "message": "If that email exists, a reset key has been sent."
    }

    return response


@router.post("/reset")
def reset_password(payload: PasswordResetConfirm, db: Session = Depends(get_db)):
    pr = db.query(PasswordReset).filter(PasswordReset.token == payload.token).first()
    if not pr:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    # Handle naive/aware datetime comparison safely
    expires_at = pr.expires_at
    now = datetime.now(timezone.utc)
    if expires_at.tzinfo is None:
        now = now.replace(tzinfo=None)

    if expires_at < now:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == pr.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    user.hashed_password = get_password_hash(payload.new_password)
    db.delete(pr)
    db.commit()

    return {"message": "Password has been reset successfully."}
