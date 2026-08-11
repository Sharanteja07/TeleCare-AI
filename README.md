# 📱 TeleCare AI — SIM Customer Support Portal

![TeleCare AI](https://img.shields.io/badge/TeleCare%20AI-SIM%20Customer%20Support-00E676?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

TeleCare AI is a full-stack SIM-focused customer support platform that allows customers to report SIM-related problems, receive AI-assisted guidance, communicate through support workflows, and receive assistance from support engineers.

The system provides separate workflows for:
- **Customer**
- **Engineer**
- **Admin**

---

## 🌐 Live Demo

> Live deployment is currently being prepared. The application can be run locally using the setup instructions below.

### Backend API
The FastAPI backend is available locally and interactive Swagger documentation is available at:
- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

---

## 🔄 How TeleCare AI Works

```text
Customer
   ↓
Login
   ↓
Customer Dashboard
   ↓
Create SIM Support Ticket
   ↓
AI Assistant provides SIM-related guidance
   ↓
Ticket submitted
   ↓
Admin reviews ticket
   ↓
Admin assigns Engineer
   ↓
Engineer receives assigned ticket
   ↓
Engineer works on ticket
   ↓
Ticket resolved
   ↓
Customer receives updated status
   ↓
Customer submits feedback
   ↓
Admin reviews analytics
```

### Detailed Workflow Steps

1. **Customer Registration & Login**: Customers authenticate securely via single sign-on at `/` using JWT token authentication.
2. **Customer Dashboard**: Customers view active SIM tickets, submit new tickets, and launch the TeleCare AI Assistant.
3. **Ticket Creation & AI Assistance**: Customers describe their issue or interact with the AI assistant for instant SIM troubleshooting or automated ticket pre-filling.
4. **Ticket Submission**: The ticket is created with category, priority, description, and optional file attachments (PNG, JPG, PDF).
5. **Admin Review & Assignment**: Administrators open the Admin Portal to review unassigned tickets and assign qualified support engineers.
6. **Engineer Resolution Workflow**: Assigned engineers view assigned tickets in their portal, review investigation notes, inspect attachments, communicate via live chat, and update ticket status to `In Progress` or `Resolved`.
7. **Customer Notification & Feedback**: Customers see real-time status updates on their dashboard and submit rating feedback upon resolution.
8. **Admin Analytics**: Administrators monitor system performance, resolution velocity, category trends, and customer satisfaction metrics.

---

## 👥 User Roles

### Customer
- Register / Login via Universal Login.
- View personal customer dashboard and active ticket summaries.
- Create SIM support tickets with pre-filled categories.
- Search and filter personal support tickets.
- Upload document/image evidence attachments securely.
- Interact with **TeleCare AI Assistant** for automated SIM guidance.
- Track real-time ticket status updates and resolution progress.
- Submit rating feedback and reviews upon ticket resolution.

### Engineer
- Login via Universal Login.
- View assigned tickets in Engineer Dashboard.
- Open detailed ticket view with customer details and evidence.
- Review customer issue description and file attachments.
- Save internal investigation notes.
- Update ticket status (`In Progress`, `Resolved`, `Closed`).
- Engage in real-time chat with customers.

### Admin
- Login via Universal Login.
- View all enterprise customer support tickets.
- Search and filter tickets by status, priority, category, or customer.
- Assign support engineers to unassigned tickets.
- Monitor overall ticket progress and workload distribution.
- View real-time analytics (ticket volume, resolution rate, category distribution).
- Review customer feedback and rating distribution.
- Manage enterprise customer support workflows.

---

## 🤖 TeleCare AI Assistant

The **TeleCare AI Assistant** is an intelligent conversational agent intentionally restricted to SIM-related customer support.

### Supported SIM Domains
- SIM card not working / No SIM detected
- No mobile network signal / No Service
- Lost SIM card / Block lost SIM
- Damaged / Scratched SIM card
- Physical SIM replacement request
- SIM activation troubleshooting
- SIM blocked / Locked SIM
- PIN & PUK code verification guidance
- eSIM installation & QR code profile issues
- Mobile Number Portability (MNP)

### Unrelated Query Redirection
To maintain high support quality, queries outside the SIM domain are politely redirected:
- Wi-Fi / Wireless setup
- Router configuration / Reset
- Broadband / Fiber internet
- Weather & General inquiries
- Printer & Laptop hardware support

> *Example Assistant Response for Unrelated Queries*:  
> *"Hi! I am your TeleCare AI Assistant. I specialize exclusively in SIM-related support (SIM activation, replacement, lost/damaged SIMs, eSIM, PIN/PUK, and mobile network settings). For non-SIM services, please contact general support."*

---

## 📸 Application Screenshots

Application screenshots demonstrate each user portal and workflow:

### Login
- Universal Login Page (`/`) — *Multi-role access*

### Customer Portal
- Customer Dashboard (`/dashboard`)
- Create Support Ticket (`/dashboard/tickets/create`)
- My Tickets History (`/dashboard/tickets`)
- TeleCare AI Assistant (`/dashboard/chat`)
- Customer Profile (`/profile`)

### Admin Portal
- Admin Dashboard (`/admin/dashboard`)
- Ticket Management & Search (`/admin/tickets`)
- Engineer Assignment Modal (`/admin/tickets/:id`)
- System Analytics & Feedback (`/admin/analytics`)

### Engineer Portal
- Engineer Dashboard (`/engineer/dashboard`)
- Assigned Tickets (`/engineer/tickets`)
- Ticket Investigation & Notes (`/engineer/tickets/:id`)
- Status Resolution Workflow

*(Screenshots can be added to the `docs/screenshots/` directory)*

---

## 🏗️ System Architecture

### Component Data Flow

```text
React + Vite (Frontend)
       ↓
Axios / HTTP (JWT Bearer Token)
       ↓
FastAPI (Backend Router)
       ↓
REST APIs / WebSockets
       ↓
SQLAlchemy (ORM Layer)
       ↓
SQLite Database (telecom_support.db)
```

### Security & Access Control Flow

```text
User Credentials
       ↓
POST /api/auth/login
       ↓
FastAPI OAuth2 / PyJWT (HS256)
       ↓
Role Enforcement Middleware (Customer / Engineer / Admin)
       ↓
Protected Endpoint Access
```

### Support Lifecycle Flow

```text
Customer (Creates Ticket) → Ticket ("Open") → Admin (Assigns Engineer) → Ticket ("In Progress") → Engineer (Resolves Issue) → Ticket ("Resolved") → Customer (Submits Feedback)
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **HTTP Client**: Axios (with JWT interceptors)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS & Tailwind CSS (Custom Dark Telecom Theme)

### Backend
- **Framework**: Python 3.10+ & FastAPI
- **ORM**: SQLAlchemy
- **Authentication**: PyJWT (HS256) & Passlib (`pbkdf2_sha256`)
- **Real-Time Messaging**: WebSockets (`websockets`)
- **Testing**: Pytest & FastAPI TestClient

### Database
- **SQLite**: Configured for local development (`telecom_support.db`) / PostgreSQL ready

---

## 🔌 API Documentation

FastAPI automatically generates interactive OpenAPI documentation when the backend server is running locally:

- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

### Major API Router Groups

| API Router | Base Endpoint | Access | Functionality |
| :--- | :--- | :--- | :--- |
| **Authentication** | `/api/auth` | Public | Register user, Login & obtain JWT token |
| **Users** | `/api/users` | Protected | Current user lookup (`/me`) and user management |
| **Tickets** | `/api/tickets` | Protected (RBAC) | Create, query, assign engineer, update status |
| **Attachments** | `/api/tickets/{id}/attachments` | Protected | File upload, list, download, and deletion |
| **Chat** | `/api/chat` | Protected | Send ticket messages, history & WebSockets real-time stream |
| **Feedback** | `/api/feedback` | Protected | Submit rating reviews & retrieve feedback |
| **Analytics** | `/api/analytics` | Admin / Engineer | KPI stats, category breakdown, monthly trends & rating satisfaction |

---

## 👥 Team Contributions

TeleCare AI was developed as a collaborative group project by a 3-member team:

| Member | Role | Key Contributions |
| :--- | :--- | :--- |
| **Katta Durga Sharan Teja** | Backend Developer | Developed FastAPI backend, REST APIs, database schemas, JWT authentication, Role-Based Access Control (RBAC), ticket management APIs, engineer assignment, file attachments, analytics APIs, backend testing, and security hardening. |
| **Kanuri Yaswanth Kumar** | Frontend Developer | Built React/Vite frontend, Customer Portal, Engineer Portal, Admin Portal, UI/UX design system, dark telecom layout, responsive components, and frontend API integration. |
| **Baddireddi Satya Vinay** | AI & Integration Engineer | Designed TeleCare AI Assistant, SIM-only support logic, conversational fallback handling, frontend-backend API integration, end-to-end workflow testing, debugging, and validation. |

---

## 📈 Development History

The project evolved through 14 structured development stages:

1. **Project Planning & Domain Scoping**: Defined SIM customer support scope and defined Customer, Engineer, and Admin roles.
2. **Backend Architecture**: Configured FastAPI project layout, router architecture, dependency injection, and SQLite database connection.
3. **Database Implementation**: Designed SQLAlchemy ORM models (`User`, `Ticket`, `ChatMessage`, `Attachment`, `Feedback`, `TicketActivity`).
4. **Authentication & Authorization**: Implemented password hashing (`pbkdf2_sha256`), JWT token creation, and `RoleChecker` dependencies.
5. **Ticket Management Engine**: Created role-aware ticket CRUD APIs, query filtering, pagination, and status state machine.
6. **Frontend UI/UX Development**: Built React components, dark glassmorphism styling, navigation headers, and role layouts.
7. **AI Assistant Integration**: Developed `AIAssistant` component and `AITelecomEngine` with SIM keyword classification and custom action buttons.
8. **Admin Engineer Assignment**: Integrated `PUT /api/tickets/{id}/assign` workflow allowing admins to delegate unassigned tickets to engineers.
9. **Secure File Attachments**: Added MIME/extension checking (`.png`, `.jpg`, `.pdf`), UUID file naming, and path traversal protections.
10. **Analytics & Feedback**: Implemented ratings, feedback submission, category distribution reporting, and engineer workload metrics.
11. **Security Hardening**: Sanitized hardcoded credentials, isolated secrets in `.env`, and configured CORS origin filters.
12. **Automated Testing Suite**: Created `pytest` test suite (`backend/tests/test_audit.py`) achieving 100% test pass rate across critical workflows.
13. **Final UI Quality Pass**: Fixed input autocomplete attributes, action button formatting, and keyboard accessibility.
14. **GitHub Release**: Initialized Git, created production-ready documentation, and published repository to GitHub.

---

## 🎥 Recommended Demo Flow

Follow this 2–3 minute workflow to demonstrate the full application:

1. **Open Application**: Navigate to `http://localhost:5173/` in your browser.
2. **Login as Customer**: Sign in using `customer` / `customerpassword`.
3. **Customer Dashboard**: Review active ticket summary and click **"+ Create Support Ticket"**.
4. **AI Assistant Interaction**: Open **"Ask AI Support"** (`/dashboard/chat`), type `"I lost my SIM"`, and observe the automated guidance and formatted action buttons.
5. **Submit Support Ticket**: Create a ticket with Category `"SIM Lost"`, Priority `"High"`, and upload a sample PNG/PDF image.
6. **Login as Admin**: Logout and log in as `admin` / `adminpassword`.
7. **Admin Assignment**: Open **Admin Tickets** (`/admin/tickets`), view the newly created unassigned ticket, click **"Assign Ticket"**, select `engineer`, and confirm.
8. **Login as Engineer**: Logout and log in as `engineer` / `engineerpassword`.
9. **Engineer Workflow**: Open **Engineer Dashboard** (`/engineer/dashboard`), view the assigned ticket, open ticket details, add internal investigation notes, and update status to **"Resolved"**.
10. **Verify Customer Resolution**: Logout and log in back as `customer`.
11. **Submit Feedback**: Open the resolved ticket, confirm status is updated, and submit a 5-star rating feedback.
12. **Review Admin Analytics**: Log in as `admin` and open **Analytics** (`/admin/analytics`) to observe updated ticket resolution charts and ratings.

---

## ⚙️ Local Setup

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Git

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Create environment configuration
cp .env.example .env

# Start FastAPI backend server
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd ai-support-system-frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

---

## 🔐 Security

- **JWT Authentication**: Standard Bearer token authentication with configurable expiration.
- **Role-Based Access Control**: Backend-enforced role authorization (`Customer`, `Engineer`, `Admin`) on all endpoints.
- **Protected Frontend Routes**: Client-side route guards complement backend API protection.
- **Input Validation**: Pydantic schema validation at API boundaries prevents unexpected payloads.
- **Attachment Validation**: Restricted to `.png`, `.jpg`, `.jpeg`, `.pdf` with UUID storage and `os.path.realpath` path traversal checks.
- **Environment Secrets**: Sensitive keys stored in `.env`, excluded from Git version control.
- **CORS Filtering**: Explicit allowed origins configured for cross-origin security.

---

## ✅ Project Status

**Current Status**: `Feature Complete / Portfolio Ready`

- [x] Customer Portal (`/dashboard`)
- [x] Engineer Portal (`/engineer/dashboard`)
- [x] Admin Portal (`/admin/dashboard`)
- [x] Universal Single Sign-On Authentication
- [x] Role-Based Access Control (RBAC) & JWT Security
- [x] SIM Support Ticket Lifecycle (Create, Query, Assign, Resolve)
- [x] TeleCare AI Assistant (SIM-only scope)
- [x] Real-time WebSockets Chat (`/api/chat/ws/{id}`)
- [x] Secure File Attachments with Path Traversal Protection
- [x] Customer Rating & Feedback System
- [x] Admin Analytics & Engineer Workload Reporting
- [x] Pytest Automated Test Suite (`6/6 passed`)
- [x] Production Documentation & GitHub Release

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
