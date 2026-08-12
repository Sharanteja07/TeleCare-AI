import sys
import os
import uuid
from fastapi.testclient import TestClient

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Welcome" in response.json()["message"]

def test_auth_flow():
    # Register customer
    reg_response = client.post(
        "/api/auth/register",
        json={
            "username": "test_customer",
            "email": "test_customer@telecom.com",
            "password": "testpassword",
            "role": "customer"
        }
    )
    assert reg_response.status_code == 201 or reg_response.status_code == 400
    
    # Login customer
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "test_customer",
            "password": "testpassword"
        }
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get profile
    me_response = client.get("/api/users/me", headers=headers)
    assert me_response.status_code == 200
    assert me_response.json()["username"] == "test_customer"
    
    # Create ticket
    ticket_response = client.post(
        "/api/tickets",
        json={
            "title": "Slow Internet Connection",
            "description": "My internet speed is less than 5 Mbps instead of 100 Mbps.",
            "category": "SIM Not Working",
            "priority": "High"
        },
        headers=headers
    )
    assert ticket_response.status_code == 201
    ticket = ticket_response.json()
    assert ticket["title"] == "Slow Internet Connection"
    ticket_id = ticket["id"]
    
    # Send chat message & trigger AI reply
    chat_response = client.post(
        "/api/chat/send",
        json={
            "ticket_id": ticket_id,
            "message": "I tried restarting the router but wifi light is still red."
        },
        headers=headers
    )
    assert chat_response.status_code == 201
    
    # Verify chat history (should contain user message + AI message)
    history_response = client.get(f"/api/chat/history/{ticket_id}", headers=headers)
    assert history_response.status_code == 200
    history = history_response.json()
    assert len(history) >= 2
    assert "AI_Assistant" in history[1]["sender"]["username"]
    
    # Close ticket
    close_response = client.put(f"/api/tickets/{ticket_id}/close", headers=headers)
    assert close_response.status_code == 200
    assert close_response.json()["status"] == "Closed"
    
    # Submit feedback
    feedback_response = client.post(
        "/api/feedback",
        json={
            "ticket_id": ticket_id,
            "rating": 5,
            "comment": "Awesome AI help!"
        },
        headers=headers
    )
    assert feedback_response.status_code == 201
    assert feedback_response.json()["rating"] == 5

def test_engineer_ticket_visibility():
    # Login engineer
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "engineer",
            "password": "engineerpassword"
        }
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Register a fresh customer so the test does not depend on seeded user state
    customer_username = f"test_customer_{uuid.uuid4().hex[:8]}"
    customer_email = f"{customer_username}@telecom.com"

    register_response = client.post(
        "/api/auth/register",
        json={
            "username": customer_username,
            "email": customer_email,
            "password": "testpassword",
            "role": "customer"
        }
    )
    assert register_response.status_code == 201

    cust_login_response = client.post(
        "/api/auth/login",
        data={
            "username": customer_username,
            "password": "testpassword"
        }
    )
    assert cust_login_response.status_code == 200
    cust_token = cust_login_response.json()["access_token"]
    cust_headers = {"Authorization": f"Bearer {cust_token}"}

    ticket_response = client.post(
        "/api/tickets",
        json={
            "title": "Engineer Visibility Test",
            "description": "Ticket should remain hidden to engineer until assigned.",
            "category": "SIM Not Working",
            "priority": "Medium"
        },
        headers=cust_headers
    )
    assert ticket_response.status_code == 201
    ticket_id = ticket_response.json()["id"]

    # Engineer should not see this unassigned ticket
    list_response = client.get("/api/tickets", headers=headers)
    assert list_response.status_code == 200
    assert all(ticket["id"] != ticket_id for ticket in list_response.json())

    # Assign the ticket to engineer
    me_response = client.get("/api/users/me", headers=headers)
    assert me_response.status_code == 200
    engineer_id = me_response.json()["id"]

    assign_response = client.put(
        f"/api/tickets/{ticket_id}/assign",
        json={"engineer_id": engineer_id},
        headers=headers
    )
    assert assign_response.status_code == 200
    assert assign_response.json()["engineer_id"] == engineer_id

    # Now engineer should see the ticket
    list_response_after = client.get("/api/tickets", headers=headers)
    assert list_response_after.status_code == 200
    assert any(ticket["id"] == ticket_id for ticket in list_response_after.json())


def test_admin_analytics_flow():
    # Login admin
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": "admin",
            "password": "adminpassword"
        }
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get stats
    stats_response = client.get("/api/analytics/stats", headers=headers)
    assert stats_response.status_code == 200
    assert "total_tickets" in stats_response.json()
    
    # Get categories
    cat_response = client.get("/api/analytics/category-report", headers=headers)
    assert cat_response.status_code == 200
    
    # Get satisfaction
    sat_response = client.get("/api/analytics/customer-satisfaction", headers=headers)
    assert sat_response.status_code == 200
    assert sat_response.json()["total_reviews"] > 0

def test_forgot_reset_password_flow():
    from app.database.database import SessionLocal
    from app.models.password_reset import PasswordReset
    from app.models.user import User

    # 1. Register a test user
    suffix = uuid.uuid4().hex[:8]
    email = f"otp_test_user_{suffix}@telecom.com"
    username = f"otp_test_user_{suffix}"
    password = "oldpassword"
    reg_response = client.post(
        "/api/auth/register",
        json={
            "username": username,
            "email": email,
            "password": password,
            "role": "customer"
        }
    )
    assert reg_response.status_code == 201

    # 2. Call forgot password endpoint
    forgot_response = client.post(
        "/api/auth/forgot",
        json={"email": email}
    )
    assert forgot_response.status_code == 200
    assert "reset key" in forgot_response.json()["message"].lower()

    # 3. Retrieve the generated OTP from database directly
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None
        pr = db.query(PasswordReset).filter(PasswordReset.user_id == user.id).first()
        assert pr is not None
        otp = pr.token
        # Verify it is a 6-digit numeric string
        assert len(otp) == 6
        assert otp.isdigit()
    finally:
        db.close()

    # 4. Reset the password using the OTP
    new_password = "newsecurepassword"
    reset_response = client.post(
        "/api/auth/reset",
        json={
            "token": otp,
            "new_password": new_password
        }
    )
    assert reset_response.status_code == 200
    assert "successfully" in reset_response.json()["message"].lower()

    # 5. Log in with the new password
    login_response = client.post(
        "/api/auth/login",
        data={
            "username": username,
            "password": new_password
        }
    )
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()

def test_email_otp_auth_flow(monkeypatch):
    # Mock SMTP to avoid 500 error during test execution
    import app.services.email_service as email_service
    monkeypatch.setattr(email_service, "is_smtp_configured", lambda: True)
    monkeypatch.setattr(email_service, "send_email", lambda *args, **kwargs: None)

    from app.database.database import SessionLocal
    from app.models.user_otp import UserOTP
    from app.models.user import User
    from app.auth.password import get_password_hash
    from datetime import datetime, timedelta, timezone
    import uuid

    email = f"otp_auth_{uuid.uuid4().hex[:8]}@telecom.com"

    # 1. Successful OTP generation
    send_response = client.post(
        "/api/auth/otp/send",
        json={"email": email}
      , headers={"X-Forwarded-For": "127.0.0.1"} # For IP-based testing (simulated context)
    )
    assert send_response.status_code == 200
    assert "sent successfully" in send_response.json()["message"].lower()

    # 2. Rate limiting check (cooldown)
    rate_response = client.post(
        "/api/auth/otp/send",
        json={"email": email}
    )
    assert rate_response.status_code == 429
    assert "wait 60 seconds" in rate_response.json()["detail"].lower()

    # 3. Retrieve record from DB
    db = SessionLocal()
    try:
        otp_record = db.query(UserOTP).filter(UserOTP.email == email).first()
        assert otp_record is not None
        assert otp_record.attempts == 0
    finally:
        db.close()

    # Set known hash in database for deterministic testing
    known_code = "123456"
    known_hashed = get_password_hash(known_code)

    db = SessionLocal()
    try:
        otp_record = db.query(UserOTP).filter(UserOTP.email == email).first()
        otp_record.hashed_otp = known_hashed
        db.commit()
    finally:
        db.close()

    # 4. Verification with invalid OTP
    invalid_response = client.post(
        "/api/auth/otp/verify",
        json={
            "email": email,
            "code": "111111",
            "role": "customer"
        }
    )
    assert invalid_response.status_code == 400
    assert "invalid otp" in invalid_response.json()["detail"].lower()

    db = SessionLocal()
    try:
        otp_record = db.query(UserOTP).filter(UserOTP.email == email).first()
        assert otp_record.attempts == 1
    finally:
        db.close()

    # 5. Verification with expired OTP
    db = SessionLocal()
    try:
        otp_record = db.query(UserOTP).filter(UserOTP.email == email).first()
        otp_record.expires_at = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(minutes=1)
        db.commit()
    finally:
        db.close()

    expired_response = client.post(
        "/api/auth/otp/verify",
        json={
            "email": email,
            "code": known_code,
            "role": "customer"
        }
    )
    assert expired_response.status_code == 400
    assert "expired" in expired_response.json()["detail"].lower()

    # 6. Re-generate OTP for verification and auto-registration
    db = SessionLocal()
    try:
        db.query(UserOTP).filter(UserOTP.email == email).delete()
        db.commit()
    finally:
        db.close()

    send_response2 = client.post(
        "/api/auth/otp/send",
        json={"email": email}
    )
    assert send_response2.status_code == 200

    db = SessionLocal()
    try:
        otp_record = db.query(UserOTP).filter(UserOTP.email == email).first()
        otp_record.hashed_otp = known_hashed
        db.commit()
    finally:
        db.close()

    # Verify correct code -> Auto-registers the user!
    verify_response = client.post(
        "/api/auth/otp/verify",
        json={
            "email": email,
            "code": known_code,
            "role": "customer"
        }
    )
    assert verify_response.status_code == 200
    res_data = verify_response.json()
    assert "access_token" in res_data
    assert "refresh_token" in res_data
    assert res_data["user"]["email"] == email
    assert res_data["user"]["role"] == "customer"

    # Confirm OTP record is deleted after successful verification
    db = SessionLocal()
    try:
        otp_record = db.query(UserOTP).filter(UserOTP.email == email).first()
        assert otp_record is None
        user_record = db.query(User).filter(User.email == email).first()
        assert user_record is not None
    finally:
        db.close()

if __name__ == "__main__":
    import pytest
    sys.exit(pytest.main([__file__]))
