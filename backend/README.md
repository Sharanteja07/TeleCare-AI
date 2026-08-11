# AI Telecom Customer Support Portal - Backend

Welcome to the backend of the **AI Telecom Customer Support Portal**. This application is built using **FastAPI**, **SQLAlchemy**, and **PostgreSQL** (with dynamic fallback to **SQLite** for easy development and local testing). 

It features secure JWT-based authentication, role-based access control (RBAC), automatic support-ticket management, an interactive AI support assistant, feedback loops, and advanced administrative analytics reporting.

---

## 🚀 Key Features

1. **Robust Authentication & RBAC**: Register and login with secure passwords (hashed via `bcrypt`). Access is restricted by user roles: `customer`, `engineer`, and `admin`.
2. **Ticket Lifecycle Management**: Standard CRUD operations for support tickets with status transitions (`Open`, `In Progress`, `Resolved`, `Closed`), categories (Billing, Technical, Network, Account), and priorities (Low, Medium, High).
3. **Interactive AI Customer Support**: When a customer files a ticket or sends a chat message, an automated AI agent replies with context-relevant telecom solutions (e.g. WiFi troubleshooting, billing guidance, eSIM activation help) and moves the ticket status to `In Progress`.
4. **Customer Feedback Loop**: Once a ticket is resolved or closed, customers can submit ratings (1-5 stars) and comments to rate the support quality.
5. **Real-time Analytics API**: Advanced endpoints for admins and engineers summarizing ticket stats, monthly ticket distributions, category breakdowns, customer satisfaction ratings, and engineer performance metrics.

---

## 🛠️ Project Structure

```
backend/
├── app/
│   ├── main.py                 # Application entry point and DB initialization
│   ├── config/
│   │      settings.py          # App settings loaded from .env via Pydantic
│   ├── database/
│   │      database.py          # SQLAlchemy engine & session configuration
│   ├── models/                 # SQLAlchemy database models
│   │      user.py
│   │      ticket.py
│   │      chat.py
│   │      feedback.py
│   ├── schemas/                # Pydantic validation/response schemas
│   │      user.py
│   │      ticket.py
│   │      chat.py
│   │      feedback.py
│   ├── auth/                   # Security utilities and dependencies
│   │      jwt.py
│   │      password.py
│   │      dependencies.py      # get_db, get_current_user, RoleChecker
│   ├── api/                    # API route controllers
│   │      auth.py              # Register, login
│   │      users.py             # User profile, user lists
│   │      tickets.py           # Ticket CRUD, assign, status update, close
│   │      chat.py              # Send/receive messages, chat history
│   │      feedback.py          # Submit and view feedback
│   │      analytics.py         # Advanced reporting and aggregations
│
├── tests/
│   └── test_api.py             # Full integration test suite
├── requirements.txt            # Python dependencies
├── .env                        # Local configurations
└── README.md                   # Setup guide (this file)
```

---

## ⚙️ Configuration & Installation

### 1. Prerequisites
- Python 3.9+
- PostgreSQL database (optional - defaults to a local SQLite file if not configured)

### 2. Set Up Virtual Environment
```bash
# Clone/Navigate to project folder
cd D:\AI-Telecom-Customer-Support-Portal\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Database Setup
By default, the backend is configured to use a local **SQLite** database (`telecom_support.db`) so you can run and test it immediately without setup. 

To switch to **PostgreSQL**, edit the `.env` file in the backend root directory:
```env
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>
```

---

## 🏃 Running the Application

Start the development server using `uvicorn`:
```bash
uvicorn app.main:app --reload
```
The server will start at **`http://127.0.0.1:8000`**.

### 📄 API Documentation (Swagger UI)
FastAPI automatically generates an interactive Swagger UI. Open your browser and navigate to:
👉 **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

## 🔑 Seeded Test Credentials

On startup, the system automatically detects if the database is empty and seeds three test accounts with standard passwords to make testing easy:

| Role | Username | Password | Email |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `adminpassword` | `admin@telecom.com` |
| **Engineer** | `engineer` | `engineerpassword` | `engineer@telecom.com` |
| **Customer** | `customer` | `customerpassword` | `customer@telecom.com` |

---

## 🧪 Testing the API

To run the automated integration tests:
```bash
pytest tests/test_api.py
```
This suite verifies the complete API flow including registration, ticket creation, automated AI helper response in chat, resolution, and admin analytics queries.
