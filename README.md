# TeleCare AI — SIM Customer Support Portal

![TeleCare AI](https://img.shields.io/badge/TeleCare%20AI-SIM%20Customer%20Support-00E676?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

An enterprise-grade, SIM-focused AI customer support portal built with **React**, **FastAPI**, **SQLAlchemy**, and **WebSockets**. Designed to streamline SIM card activations, replacements, lost/blocked SIM workflows, eSIM troubleshooting, PIN/PUK verification, and engineer assignments across three role-based portals (**Customer**, **Engineer**, and **Admin**).

---

## 🚀 Overview

**TeleCare AI** is a specialized telecommunications portal focused exclusively on **SIM card customer support**. It provides unified single sign-on authentication, real-time ticket messaging with an embedded **TeleCare AI Support Assistant**, secure document/image evidence attachments, admin engineer assignment workflows, and analytics dashboards.

### User Roles & Workflows

1. **Customer Portal (`/dashboard`)**:
   - Register & Login via Single Sign-On at `/`.
   - Submit SIM-focused support tickets (SIM Activation, Lost SIM, Damaged SIM, eSIM, PUK, Portability, Billing).
   - Chat with **TeleCare AI Assistant** for automated SIM troubleshooting & quick action triggers.
   - Attach image/PDF evidence (PNG, JPG, PDF) securely.
   - Track ticket resolution timeline and submit rating feedback.

2. **Engineer Portal (`/engineer/dashboard`)**:
   - Authenticate via Single Sign-On at `/`.
   - View assigned SIM tickets filtered dynamically by backend role authorization.
   - Update ticket status (`In Progress`, `Resolved`, `Closed`).
   - Add internal investigation notes and chat directly with customers in real-time.

3. **Admin Portal (`/admin/dashboard`)**:
   - Authenticate via Single Sign-On at `/`.
   - Monitor all incoming customer tickets across the enterprise.
   - Assign unassigned tickets to support engineers.
   - View workload performance metrics, ticket category analytics, and customer satisfaction reports.

---

## ✨ Key Features

- 🔐 **Role-Based Access Control (RBAC)**: Enforced via FastAPI JWT Bearer tokens for Customer, Engineer, and Admin roles.
- 🤖 **TeleCare AI Assistant**: Specialized SIM support assistant capable of handling SIM activation, lost/blocked SIM workflows, eSIM setup, and PUK code verification while filtering out non-SIM inquiries.
- ⚡ **Real-Time Ticket Chat**: Embedded WebSockets (`/api/chat/ws/{ticket_id}`) with REST polling fallback.
- 📎 **Secure Attachment Management**: Restricts file uploads to PNG, JPG, JPEG, and PDF; stores files with UUID names; and enforces path traversal protections.
- 📊 **Analytics & Reporting**: Interactive charts showing ticket status distributions, category breakdowns, monthly volume trends, and engineer resolution rates.
- 🧪 **Automated Test Suite**: Comprehensive pytest integration suite covering authentication, RBAC, ticket lifecycles, and attachment security.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **HTTP Client**: Axios (with JWT interceptors)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS & Tailwind CSS (Custom Dark Telecom Theme)

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **ORM**: SQLAlchemy
- **Database**: SQLite (default for local development) / PostgreSQL ready
- **Authentication**: PyJWT (HS256) & Passlib (`pbkdf2_sha256`)
- **Real-Time**: WebSockets (`websockets`)
- **Testing**: Pytest & FastAPI TestClient

---

## 📂 Project Structure

```text
AI-Telecom-Customer-Support-Portal/
│
├── ai-support-system-frontend/    # React + Vite Frontend Application
│   ├── public/                    # Static web assets & icons
│   ├── src/                       # React components, pages, context & services
│   │   ├── components/            # Reusable UI cards, buttons, navbar & chat window
│   │   ├── context/               # AuthContext & state providers
│   │   ├── pages/                 # Role-based pages (auth, customer, engineer, admin)
│   │   ├── services/              # Axios httpClient & TeleCare AI engine
│   │   ├── App.jsx                # Main router configuration
│   │   └── main.jsx               # React entry point
│   ├── package.json               # Frontend dependencies
│   └── vite.config.js             # Vite build configuration
│
├── backend/                       # FastAPI Backend Application
│   ├── app/                       # Application core
│   │   ├── api/                   # API Routers (auth, users, tickets, chat, feedback, analytics)
│   │   ├── auth/                  # JWT token handler & password hashing
│   │   ├── config/                # Environment configuration settings
│   │   ├── database/              # SQLAlchemy session & base models
│   │   ├── models/                # Database ORM models (User, Ticket, Chat, Attachment)
│   │   ├── schemas/               # Pydantic validation schemas
│   │   └── services/              # Email service & helper modules
│   ├── tests/                     # Pytest backend automated test suite
│   ├── uploads/                   # Secure tickets file storage
│   ├── .env.example               # Environment template file
│   ├── main.py                    # FastAPI server entry point & database seeder
│   └── requirements.txt           # Python dependencies
│
├── .gitignore                     # Git exclusion rules
├── LICENSE                        # MIT License
└── README.md                      # Project documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Git**

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment configuration from template
cp .env.example .env
```

---

### 2. Environment Configuration (`backend/.env`)

Edit `backend/.env` to configure JWT secret and optional SMTP credentials:

```env
# Database Configuration
DATABASE_URL=sqlite:///./telecom_support.db

# JWT Authentication Config
JWT_SECRET_KEY=your_random_jwt_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Email Service Config (Optional - Console fallback included)
EMAIL_ADDRESS=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

---

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ai-support-system-frontend

# Install dependencies
npm install
```

---

## 🚀 Running the Application

### 1. Start FastAPI Backend Server

```bash
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
> The API server will start at `http://127.0.0.1:8000`.

### 2. Start Vite Frontend Development Server

```bash
cd ai-support-system-frontend
npm run dev
```
> The frontend application will start at `http://localhost:5173`.

---

## 🔐 Default Access Credentials

The database auto-seeds test accounts on initial startup:

| Role | Username | Password | Redirection Route |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer` (or `teja`) | `customerpassword` (or `Password@123`) | `/dashboard` |
| **Engineer** | `engineer` | `engineerpassword` | `/engineer/dashboard` |
| **Admin** | `admin` | `adminpassword` | `/admin/dashboard` |

---

## 📖 Interactive API Documentation

Once the backend server is running, access the interactive OpenAPI docs:

- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🧪 Running Automated Tests

Run the backend Pytest test suite:

```bash
cd backend
.\venv\Scripts\python.exe -m pytest tests/test_audit.py -v
```

Output:
```text
tests/test_audit.py::test_login_success PASSED
tests/test_audit.py::test_current_user_me PASSED
tests/test_audit.py::test_registration PASSED
tests/test_audit.py::test_ticket_lifecycle_and_security PASSED
tests/test_audit.py::test_file_attachment_security PASSED
tests/test_audit.py::test_analytics_role_protection PASSED

============================= 6 passed in 15.33s ==============================
```

---

## 📸 Screenshots

*(Add application dashboard and AI chat screenshots here)*

---

## 🛡️ Security Controls

1. **Authentication**: JWT Bearer token standard with configurable expiration (`ACCESS_TOKEN_EXPIRE_MINUTES`).
2. **Role Authorization**: Strict role checking on all APIs prevents customers from accessing admin analytics or unauthorized tickets.
3. **Attachment Protection**: File extensions restricted to `.png`, `.jpg`, `.jpeg`, `.pdf` with path traversal protections (`os.path.realpath`).
4. **Secret Isolation**: Private keys and database credentials managed via `.env` files, excluded from version control.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
