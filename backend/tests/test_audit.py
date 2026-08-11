import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.ticket import Ticket
from app.auth.password import get_password_hash

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Ensure test users exist with known credentials
    def ensure_user(username, email, password, role):
        u = db.query(User).filter(User.username == username).first()
        if not u:
            u = User(username=username, email=email, hashed_password=get_password_hash(password), role=role, is_active=True)
            db.add(u)
        else:
            u.hashed_password = get_password_hash(password)
            u.role = role
            u.is_active = True
        return u

    ensure_user("admin_test", "admin_test@telecare.com", "adminpassword", "admin")
    ensure_user("engineer_test", "engineer_test@telecare.com", "engineerpassword", "engineer")
    ensure_user("customer_test", "customer_test@telecare.com", "customerpassword", "customer")
    
    db.commit()
    db.close()

def get_token(username, password):
    res = client.post("/api/auth/login", data={"grant_type": "password", "username": username, "password": password, "scope": "", "client_id": "", "client_secret": ""})
    assert res.status_code == 200
    return res.json()["access_token"]

# 1. Authentication & Registration Tests
def test_login_success():
    token = get_token("admin_test", "adminpassword")
    assert token is not None

def test_current_user_me():
    token = get_token("customer_test", "customerpassword")
    res = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["username"] == "customer_test"
    assert res.json()["role"] == "customer"

def test_registration():
    import uuid
    uname = f"user_{uuid.uuid4().hex[:8]}"
    res = client.post("/api/auth/register", json={
        "username": uname,
        "email": f"{uname}@telecare.com",
        "password": "Password123!"
    })
    assert res.status_code == 201
    assert res.json()["username"] == uname

# 2. Ticket Creation, Ownership & Role Protection Tests
def test_ticket_lifecycle_and_security():
    cust_token = get_token("customer_test", "customerpassword")
    eng_token = get_token("engineer_test", "engineerpassword")
    admin_token = get_token("admin_test", "adminpassword")

    # Customer creates ticket
    t_res = client.post("/api/tickets", json={
        "title": "SIM Card Activation Issue",
        "description": "My new SIM card is not activating on network.",
        "category": "SIM Activation",
        "priority": "High"
    }, headers={"Authorization": f"Bearer {cust_token}"})
    assert t_res.status_code == 201
    ticket_id = t_res.json()["id"]
    assert t_res.json()["status"] == "Open"
    assert t_res.json()["engineer_id"] is None

    # Security check: Engineer passing engineer_id query param -> Should return 403 Forbidden
    sec_res = client.get("/api/tickets?engineer_id=1", headers={"Authorization": f"Bearer {eng_token}"})
    assert sec_res.status_code == 403

    # Admin GET /users to find engineer ID
    users = client.get("/api/users", headers={"Authorization": f"Bearer {admin_token}"}).json()
    engineer_obj = next(u for u in users if u["role"] == "engineer" and u["username"] == "engineer_test")

    # Admin assigns ticket to engineer
    assign_res = client.put(f"/api/tickets/{ticket_id}/assign", json={"engineer_id": engineer_obj["id"]}, headers={"Authorization": f"Bearer {admin_token}"})
    assert assign_res.status_code == 200
    assert assign_res.json()["engineer_id"] == engineer_obj["id"]
    assert assign_res.json()["status"] == "In Progress"

    # Engineer GET /tickets after assignment -> Should see assigned ticket
    e_tickets_after = client.get("/api/tickets", headers={"Authorization": f"Bearer {eng_token}"}).json()
    assert any(t["id"] == ticket_id for t in e_tickets_after)

    # Engineer updates ticket status to Resolved
    st_res = client.put(f"/api/tickets/{ticket_id}/status", json={"status": "Resolved"}, headers={"Authorization": f"Bearer {eng_token}"})
    assert st_res.status_code == 200
    assert st_res.json()["status"] == "Resolved"

    # Customer verifies updated ticket status
    cust_t = client.get(f"/api/tickets/{ticket_id}", headers={"Authorization": f"Bearer {cust_token}"}).json()
    assert cust_t["status"] == "Resolved"

# 3. File Attachment Security Tests
def test_file_attachment_security():
    cust_token = get_token("customer_test", "customerpassword")

    # Customer creates ticket
    t_res = client.post("/api/tickets", json={
        "title": "Physical SIM Damage",
        "description": "Scratched gold contacts on SIM card.",
        "category": "SIM Damaged",
        "priority": "Medium"
    }, headers={"Authorization": f"Bearer {cust_token}"})
    ticket_id = t_res.json()["id"]

    # Reject executable upload (.exe)
    bad_upload = client.post(
        f"/api/tickets/{ticket_id}/attachments",
        files={"file": ("malicious.exe", b"binary_data", "application/x-msdownload")},
        headers={"Authorization": f"Bearer {cust_token}"}
    )
    assert bad_upload.status_code == 400

    # Accept valid image upload (.png)
    good_upload = client.post(
        f"/api/tickets/{ticket_id}/attachments",
        files={"file": ("sim_photo.png", b"fake_png_data", "image/png")},
        headers={"Authorization": f"Bearer {cust_token}"}
    )
    assert good_upload.status_code == 201

# 4. Analytics Security Tests
def test_analytics_role_protection():
    cust_token = get_token("customer_test", "customerpassword")
    admin_token = get_token("admin_test", "adminpassword")

    # Customer forbidden
    c_res = client.get("/api/analytics/stats", headers={"Authorization": f"Bearer {cust_token}"})
    assert c_res.status_code == 403

    # Admin allowed
    a_res = client.get("/api/analytics/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert a_res.status_code == 200
