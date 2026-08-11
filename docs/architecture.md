# 🏗️ TeleCare AI — Architecture Documentation

This document provides a detailed overview of the system architecture, component data flow, security model, database schema, AI assistant workflow, and production deployment topology for **TeleCare AI — SIM Customer Support Portal**.

---

## 🏛️ High-Level System Architecture

The following Mermaid diagram represents the overall system architecture and key interaction boundaries:

```mermaid
graph TD
    subgraph Users ["👥 User Roles & Access Points"]
        Customer["📱 Customer (Portal)"]
        Engineer["🛠️ Support Engineer (Portal)"]
        Admin["👑 System Administrator (Portal)"]
    end

    subgraph Frontend ["💻 Frontend Layer (React 18 + Vite)"]
        UI["React SPA UI Components"]
        State["Auth & Application State"]
        Router["Client Route Guards (RBAC)"]
    end

    subgraph Transport ["🌐 Network & Protocol Layer"]
        REST["HTTPS REST API (Axios + JWT)"]
        WS["Secure WebSockets (wss://)"]
    end

    subgraph Backend ["⚡ Backend Service Layer (FastAPI)"]
        API["FastAPI Application (app.main:app)"]
        AuthMiddleware["JWT Authentication & RBAC Middleware"]
        TicketEngine["Ticket State Machine Engine"]
        AIEngine["TeleCare AI Assistant Engine"]
        NotificationEngine["Notification Service"]
    end

    subgraph Persistence ["🗄️ Database & Storage Layer"]
        DB[(PostgreSQL Database)]
        Uploads["Secure File Storage (uploads/)"]
    end

    Customer --> UI
    Engineer --> UI
    Admin --> UI

    UI --> State
    State --> Router
    Router --> REST
    Router --> WS

    REST --> AuthMiddleware
    WS --> AuthMiddleware
    AuthMiddleware --> API

    API --> TicketEngine
    API --> AIEngine
    API --> NotificationEngine

    TicketEngine --> DB
    AIEngine --> DB
    API --> Uploads
```

---

## 🔒 Authentication & Role-Based Access Control (RBAC) Flow

Authentication is managed using OAuth2 with JWT (JSON Web Tokens) signed via HMAC-SHA256 (`HS256`).

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Customer / Engineer / Admin)
    participant App as React Frontend
    participant Auth as FastAPI /api/auth/login
    participant JWT as PyJWT Handler
    participant Middleware as RoleChecker Middleware
    participant Route as Protected API Route

    User->>App: Submits Username & Password
    App->>Auth: POST /api/auth/login (form-data)
    Auth->>Auth: Verify PBKDF2 Password Hash
    Auth->>JWT: Generate JWT Access Token (sub, role, user_id, exp)
    JWT-->>App: Return access_token & token_type Bearer
    App->>App: Store token in localStorage

    User->>App: Request Protected Resource
    App->>Route: GET/POST API Request (Header: Authorization Bearer <token>)
    Route->>Middleware: Intercept & Validate JWT Token
    Middleware->>Middleware: Verify Token Expiration & Role Authority
    alt Authorization Valid
        Middleware->>Route: Allow Request Execution
        Route-->>App: Return HTTP 200/201 JSON Data
    else Invalid Token or Role Denied
        Middleware-->>App: Return HTTP 401 Unauthorized / 403 Forbidden
    end
```

---

## 🎫 Ticket Lifecycle & Escalation Workflow

The ticket lifecycle follows a strict state-machine progression ensuring audit trail logging at every state transition:

```mermaid
stateDiagram-v2
    [*] --> Open: Customer Creates SIM Ticket
    Open --> InProgress: Admin Assigns Engineer
    InProgress --> Resolved: Engineer Re-seats SIM / Updates Notes
    Resolved --> Closed: Ticket Resolution Confirmed
    Resolved --> CustomerFeedback: Customer Rates Resolution (1-5 Stars)
    CustomerFeedback --> [*]
    Closed --> [*]
```

### End-to-End Sequence

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    participant F as Frontend
    participant B as Backend API
    actor A as Admin
    actor E as Engineer
    participant DB as PostgreSQL DB

    C->>F: Create SIM Support Ticket ("SIM Not Working")
    F->>B: POST /api/tickets
    B->>DB: Save Ticket (Status: Open, engineer_id: null)
    B-->>F: Ticket Created (HTTP 201)

    A->>F: Open Admin Dashboard
    F->>B: GET /api/tickets?status=Open
    B-->>F: List Unassigned Tickets
    A->>F: Select Engineer & Assign
    F->>B: PUT /api/tickets/{id}/assign (engineer_id: 2)
    B->>DB: Update Ticket (Status: In Progress, engineer_id: 2)
    B-->>F: Ticket Assigned (HTTP 200)

    E->>F: Open Engineer Workspace
    F->>B: GET /api/tickets (as engineer)
    B-->>F: List Assigned Tickets
    E->>F: Investigate & Add Notes
    F->>B: PUT /api/tickets/{id}/notes
    F->>B: PUT /api/tickets/{id}/status (Status: Resolved)
    B->>DB: Persist Notes & Status Change
    B-->>F: Status Updated (HTTP 200)

    C->>F: View Resolved Ticket
    F->>B: GET /api/tickets/{id}
    C->>F: Submit 5-Star Rating Feedback
    F->>B: POST /api/feedback
    B->>DB: Persist Rating & Review
    B-->>F: Feedback Saved (HTTP 201)
```

---

## 🤖 TeleCare AI Assistant Workflow

The **TeleCare AI Assistant** provides automated SIM guidance and interactive action buttons while maintaining strict domain scoping:

```mermaid
flowchart TD
    Start([Customer Sends Message]) --> InputCheck{Input Analysis}
    
    InputCheck -->|SIM Keyword Match| SIMProcessor[Process SIM Troubleshooting]
    InputCheck -->|Non-SIM Keyword Match| ScopeRedirection[Generate SIM-Only Scope Explanation]

    SIMProcessor --> SIMType{SIM Query Category}
    
    SIMType -->|Lost / Stolen SIM| LostSIMActions[Generate Guidance + Action Buttons]
    SIMType -->|SIM Not Working / Signal| SignalHelp[Generate SIM Re-seating Steps]
    SIMType -->|eSIM / QR Profile| eSIMHelp[Generate eSIM Installation Guide]
    SIMType -->|PUK Code Request| PUKHelp[Generate PUK Verification Steps]

    LostSIMActions --> RenderButtons["Render Action Buttons:<br/>[ Block Lost SIM ]<br/>[ Request Replacement ]<br/>[ Contact Support Engineer ]"]

    ScopeRedirection --> OutputResponse["Polite Redirection:<br/>'I specialize exclusively in SIM-related support...'"]
    RenderButtons --> OutputResponse
    SignalHelp --> OutputResponse
    eSIMHelp --> OutputResponse
    PUKHelp --> OutputResponse

    OutputResponse --> End([Deliver Chat Message to User])
```

---

## 🌐 Production Deployment Topology

The application is deployed on **Render** cloud platform with secure environment isolation:

```mermaid
graph LR
    subgraph Client ["Client Browser"]
        Browser["React 18 SPA"]
    end

    subgraph Network ["CDN & Network"]
        HTTPS["HTTPS TLS 1.3 / SSL"]
    end

    subgraph RenderHost ["Render Cloud Service"]
        Uvicorn["Uvicorn Server Process"]
        FastAPIApp["FastAPI Main (app.main:app)"]
        HealthEndpoint["GET /health (HTTP 200)"]
    end

    subgraph DatabaseHost ["Managed PostgreSQL Database"]
        Postgres[(PostgreSQL)]
    end

    Browser -->|HTTPS| HTTPS
    HTTPS --> Uvicorn
    Uvicorn --> FastAPIApp
    FastAPIApp --> HealthEndpoint
    FastAPIApp -->|DATABASE_URL| Postgres
```

### Production Service Parameters

- **Service Type**: Render Web Service
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`
- **Production Base URL**: `https://telecare-ai.onrender.com`
- **Interactive OpenAPI Documentation**: `https://telecare-ai.onrender.com/docs`

---

## 📂 Core Component Responsibilities

### 1. Frontend (`ai-support-system-frontend`)
- **Single Page Application (SPA)** built with React 18 and Vite.
- Manages local authentication state, JWT storage, and `Authorization` header injection.
- Provides client-side role guards (`/dashboard`, `/engineer/dashboard`, `/admin/dashboard`).
- Renders responsive telecom dark mode interfaces, real-time WebSocket chat windows, and analytics dashboards.

### 2. Backend (`backend/app`)
- **FastAPI Engine** handling REST API routing, Pydantic validation, and dependency injection.
- **Security Services**: Password hashing via `pbkdf2_sha256`, JWT creation/decoding, and `RoleChecker` authorization.
- **Ticket Engine**: Manages ticket creation, assignment, status state changes, and automated audit activity logging.
- **AI Chat Engine**: Evaluates incoming customer inquiries, generates domain-specific SIM guidance, and powers action buttons.

### 3. Database Layer (`PostgreSQL`)
- **SQLAlchemy ORM** models:
  - `User`: Accounts, credentials, roles (`customer`, `engineer`, `admin`), and login audit timestamps.
  - `Ticket`: SIM support tickets, categories, priorities, statuses, customer/engineer relationships, and diagnostic notes.
  - `ChatMessage`: Ticket message history and AI assistant responses.
  - `Attachment`: Metadata for uploaded file evidence (`.png`, `.jpg`, `.pdf`).
  - `Feedback`: Customer resolution rating reviews (1 to 5 stars).
  - `TicketActivity`: Automated ticket audit log records.
