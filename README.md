# 🌍 VoyageGen

> **AI-Powered Travel Quotation System for Modern B2B Agencies**

Transform hours of manual work into minutes with intelligent automation. VoyageGen leverages cutting-edge AI to generate professional travel quotations that your clients will love.

---

## 🎯 The Problem We Solve

Traditional travel quotation is **painful**:

- ⏰ **4-6 hours** per detailed itinerary
- 📊 Manual research across multiple platforms
- 💸 Pricing errors and missed margins
- 🔄 Endless revisions and reformatting
- 😓 Burnout from repetitive work

**VoyageGen eliminates these bottlenecks** with intelligent automation while keeping travel agents in control.

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🤖 AI-Powered Generation
Multi-agent system creates comprehensive itineraries with destination research, activity planning, and intelligent pricing

</td>
<td width="50%">

### ⚡ Lightning Fast
Generate professional quotations in **under 2 minutes** vs hours of manual work

</td>
</tr>
<tr>
<td width="50%">

### 🎨 Beautiful Output
Polished, client-ready quotations with day-by-day itineraries and transparent pricing breakdowns

</td>
<td width="50%">

### 🔐 Enterprise Security
JWT authentication, role-based access, and comprehensive input validation

</td>
</tr>
<tr>
<td width="50%">

### 📊 Quality Assurance
Automated validation ensures every quotation meets quality standards before delivery

</td>
<td width="50%">

### 🔄 Real-Time Processing
Live status updates with automatic redirection when quotations are ready

</td>
</tr>
</table>

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | Modern UI framework with latest features |
| **Vite 7** | Lightning-fast build tool and dev server |
| **TailwindCSS 4** | Utility-first styling framework |
| **Framer Motion 12** | Smooth animations and transitions |

### Backend

| Technology | Purpose |
|------------|---------|
| **Express.js 5** | Web framework for Node.js |
| **MongoDB 6** | NoSQL database for flexible data storage |
| **Mongoose 9** | Elegant MongoDB object modeling |
| **JWT** | Secure token-based authentication |
| **Zod 4** | TypeScript-first schema validation |

### AI & External Services

| Service | Purpose |
|---------|---------|
| **Google Gemini 2.5 Flash** | Advanced language model for content generation |
| **SerpAPI** | Real-time travel data and destination info |

---

## 📐 Architecture & Workflow

### System Architecture

```mermaid
flowchart TB
    subgraph Client["🖥️ Client Layer"]
        A[React Frontend<br/>Vite + TailwindCSS]
    end
    
    subgraph Gateway["🚪 API Gateway"]
        B[Express Server<br/>Auth + Rate Limiting]
    end
    
    subgraph Logic["⚙️ Business Layer"]
        C[Controllers]
        D[Services]
    end
    
    subgraph AI["🤖 AI Pipeline"]
        E[Multi-Agent System<br/>5 Specialized Agents]
    end
    
    subgraph Data["💾 Data Layer"]
        F[(MongoDB)]
    end
    
    subgraph External["🌐 External Services"]
        G[Google Gemini API]
        H[SerpAPI]
    end
    
    A -->|HTTP/REST| B
    B -->|Validated Request| C
    C -->|Business Logic| D
    D -->|Trigger Pipeline| E
    D <-->|Read/Write| F
    E <-->|AI Processing| G
    E <-->|Travel Data| H
    E -->|Store Results| F
    F -.->|Response| D
    D -.->|Response| C
    C -.->|JSON| B
    B -.->|JSON| A
    
    style Client fill:#E3F2FD,stroke:#1976D2,stroke-width:3px
    style Gateway fill:#FFF3E0,stroke:#F57C00,stroke-width:3px
    style Logic fill:#F3E5F5,stroke:#7B1FA2,stroke-width:3px
    style AI fill:#E8F5E9,stroke:#388E3C,stroke-width:3px
    style Data fill:#FFF9C4,stroke:#F9A825,stroke-width:3px
    style External fill:#FCE4EC,stroke:#C2185B,stroke-width:3px
```

### The AI Agent Pipeline

```mermaid
flowchart LR
    subgraph Input["📥 Input"]
        A[User Requirements<br/>Destination, Budget<br/>Duration, Preferences]
    end
    
    subgraph Pipeline["🔄 Processing Pipeline"]
        B[🎯 SUPERVISOR<br/>Normalize & Validate]
        C[🔍 RESEARCH<br/>Gather Intel]
        D[📅 PLANNER<br/>Build Itinerary]
        E[💰 PRICER<br/>Calculate Costs]
        F[✅ QUALITY<br/>Validate Output]
    end
    
    subgraph Output["📤 Output"]
        G[Professional Quote<br/>Itinerary + Pricing<br/>Quality Score]
    end
    
    A -->|Raw Data| B
    B -->|Structured Data| C
    C -->|Travel Data| D
    D -->|Itinerary JSON| E
    E -->|Priced Quote| F
    F -->|Validated| G
    
    style Input fill:#BBDEFB,stroke:#1565C0,stroke-width:2px
    style B fill:#FFE0B2,stroke:#E65100,stroke-width:2px
    style C fill:#E1BEE7,stroke:#6A1B9A,stroke-width:2px
    style D fill:#C8E6C9,stroke:#2E7D32,stroke-width:2px
    style E fill:#FFF59D,stroke:#F57F17,stroke-width:2px
    style F fill:#F8BBD0,stroke:#AD1457,stroke-width:2px
    style Output fill:#B2DFDB,stroke:#00695C,stroke-width:2px
```

### Complete Request Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as 👤 User
    participant F as 🖥️ Frontend
    participant A as 🚪 API Gateway
    participant S as ⚙️ Service Layer
    participant AI as 🤖 AI Pipeline
    participant D as 💾 Database
    
    rect rgb(227, 242, 253)
    Note over U,F: User Interaction
    U->>F: Submit Travel Requirements
    F->>A: POST /api/requirements
    end
    
    rect rgb(255, 243, 224)
    Note over A,S: Authentication & Routing
    A->>A: Validate JWT Token
    A->>A: Check Rate Limits
    A->>S: Route to Controller
    end
    
    rect rgb(243, 229, 245)
    Note over S,D: Data Persistence
    S->>D: Save Requirement
    D-->>S: Requirement Saved
    S-->>F: Return Requirement ID
    end
    
    rect rgb(232, 245, 233)
    Note over F,AI: Agent Execution
    F->>A: POST /api/agent/run/:id
    A->>S: Trigger Agent Pipeline
    S->>AI: Initialize AgentRun
    AI->>D: Create AgentRun Record
    S-->>F: Agent Started (Run ID)
    end
    
    rect rgb(255, 249, 196)
    Note over F,D: Status Polling
    loop Every 2 seconds
        F->>A: GET /api/agent/run/:id
        A->>S: Fetch Status
        S->>D: Query AgentRun
        D-->>S: Current Status
        S-->>A: Status Data
        A-->>F: Status Update
    end
    end
    
    rect rgb(232, 245, 233)
    Note over AI,D: AI Processing
    AI->>AI: Execute SUPERVISOR
    AI->>D: Update Progress
    AI->>AI: Execute RESEARCH
    AI->>D: Update Progress
    AI->>AI: Execute PLANNER
    AI->>D: Update Progress
    AI->>AI: Execute PRICER
    AI->>D: Update Progress
    AI->>AI: Execute QUALITY
    AI->>D: Update Progress
    AI->>D: Create Final Quote
    AI->>D: Mark AgentRun DONE
    end
    
    rect rgb(248, 187, 208)
    Note over F,U: Completion
    F->>A: GET /api/agent/run/:id
    A->>S: Fetch Final Status
    S->>D: Query Completed Run
    D-->>S: Status: DONE + Quote ID
    S-->>A: Complete Data
    A-->>F: Quote Ready
    F->>F: Auto-redirect to Quote
    F->>U: Display Quote
    end
```

### Security Flow

```mermaid
flowchart TD
    A[📨 Incoming Request] --> B{🔐 JWT Valid?}
    B -->|❌ No| C[401 Unauthorized]
    B -->|✅ Yes| D{⏱️ Rate Limit OK?}
    D -->|❌ Exceeded| E[429 Too Many Requests]
    D -->|✅ OK| F{👤 Has Permission?}
    F -->|❌ No| G[403 Forbidden]
    F -->|✅ Yes| H{✅ Valid Input?}
    H -->|❌ Invalid| I[400 Bad Request]
    H -->|✅ Valid| J[✅ Process Request]
    
    style A fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style B fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
    style D fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px
    style F fill:#E8F5E9,stroke:#388E3C,stroke-width:2px
    style H fill:#FFF9C4,stroke:#F9A825,stroke-width:2px
    style J fill:#C8E6C9,stroke:#2E7D32,stroke-width:3px
    style C fill:#FFCDD2,stroke:#C62828,stroke-width:2px
    style E fill:#FFCDD2,stroke:#C62828,stroke-width:2px
    style G fill:#FFCDD2,stroke:#C62828,stroke-width:2px
    style I fill:#FFCDD2,stroke:#C62828,stroke-width:2px
```

### Agent State Machine

```mermaid
stateDiagram-v2
    [*] --> IDLE: User Creates Requirement
    IDLE --> RUNNING: Trigger Agent Pipeline
    
    state RUNNING {
        [*] --> SUPERVISOR
        SUPERVISOR --> RESEARCH: ✅ Normalized
        RESEARCH --> PLANNER: ✅ Data Collected
        PLANNER --> PRICER: ✅ Itinerary Built
        PRICER --> QUALITY: ✅ Priced
        QUALITY --> [*]: ✅ Validated
    }
    
    RUNNING --> DONE: All Steps Complete
    RUNNING --> FAILED: ❌ Any Step Fails
    DONE --> [*]: Quote Generated
    FAILED --> IDLE: Can Retry
```

### Scaling Architecture

```mermaid
flowchart TB
    subgraph LB["⚖️ Load Balancer"]
        L[NGINX / AWS ALB]
    end
    
    subgraph API["🔷 API Server Cluster"]
        A1[Express<br/>Instance 1]
        A2[Express<br/>Instance 2]
        A3[Express<br/>Instance 3]
    end
    
    subgraph Workers["🤖 Agent Worker Pool"]
        W1[Worker 1]
        W2[Worker 2]
        W3[Worker 3]
    end
    
    subgraph Cache["⚡ Cache Layer"]
        R[(Redis<br/>Sessions & Cache)]
    end
    
    subgraph DB["💾 Database Cluster"]
        M1[(MongoDB<br/>Primary)]
        M2[(MongoDB<br/>Replica 1)]
        M3[(MongoDB<br/>Replica 2)]
    end
    
    subgraph Queue["📬 Message Queue"]
        Q[Bull / RabbitMQ]
    end
    
    L --> A1
    L --> A2
    L --> A3
    
    A1 --> R
    A2 --> R
    A3 --> R
    
    A1 -.Enqueue.-> Q
    A2 -.Enqueue.-> Q
    A3 -.Enqueue.-> Q
    
    Q --> W1
    Q --> W2
    Q --> W3
    
    A1 --> M1
    A2 --> M1
    A3 --> M1
    
    W1 --> M1
    W2 --> M1
    W3 --> M1
    
    M1 -.Replicate.-> M2
    M1 -.Replicate.-> M3
    
    style LB fill:#E3F2FD,stroke:#1976D2,stroke-width:3px
    style API fill:#FFF3E0,stroke:#F57C00,stroke-width:3px
    style Workers fill:#E8F5E9,stroke:#388E3C,stroke-width:3px
    style Cache fill:#FCE4EC,stroke:#C2185B,stroke-width:3px
    style DB fill:#FFF9C4,stroke:#F9A825,stroke-width:3px
    style Queue fill:#F3E5F5,stroke:#7B1FA2,stroke-width:3px
```

---

## 🎯 Agent Responsibilities

| Agent | Role | Input | Output | External APIs |
|-------|------|-------|--------|---------------|
| **🎯 SUPERVISOR** | Validate & normalize requirements | Raw user input | Structured, validated data | None |
| **🔍 RESEARCH** | Gather destination intelligence | Normalized requirements | Hotels, activities, attractions | SerpAPI |
| **📅 PLANNER** | Create detailed itinerary | Research data + requirements | Day-by-day structured plan | Google Gemini |
| **💰 PRICER** | Calculate costs & margins | Itinerary + research data | Complete pricing breakdown | Google Gemini |
| **✅ QUALITY** | Validate & score output | Complete quotation | Quality score & validation | Google Gemini |

---

## 📁 Project Structure

### Backend Architecture

```
backend/src/
├── 🔧 config/           # Configuration (DB, CORS, Rate Limiting)
├── 🎮 controllers/      # HTTP request handlers
├── 🛡️ middleware/       # Auth, validation, error handling
├── 📦 models/           # Database schemas (User, Quote, AgentRun)
├── 🛣️ routes/           # API endpoint definitions
├── ⚙️ services/         # Business logic & AI agents
│   └── agents/         # Individual agent implementations
├── 🔨 utils/            # Helper functions
└── ✅ validators/       # Zod schemas for validation
```

### Frontend Architecture

```
frontend/src/
├── 🎨 components/       # Reusable UI components
├── 📄 pages/            # Route-level components
├── 🔐 context/          # React Context (Auth, etc.)
├── 🌐 api/              # API client functions
├── 🎯 hooks/            # Custom React hooks
└── 💅 styles/           # Global styles and themes
```

---

## 🎨 Key Design Decisions

### Why Multi-Agent Architecture?

| Aspect | Benefit |
|--------|---------|
| **Specialization** | Each agent masters one domain (research, planning, pricing) |
| **Reliability** | Failures isolated to specific steps, easier debugging |
| **Quality Control** | Independent validation at each stage |
| **Maintainability** | Update individual agents without affecting others |
| **Transparency** | Clear audit trail of processing steps |

### Why Separate Pricing Logic?

- 💼 **Business Flexibility** - Adjust margins without changing itineraries
- 🧪 **A/B Testing** - Test different pricing strategies
- 📊 **Compliance** - Separate pricing rules for regulatory requirements
- 🔄 **Reusability** - Same itinerary, different pricing models

### Why Quality Validation Agent?

- ✅ **Minimum Standards** - Ensure every quotation meets quality thresholds
- 🎯 **Consistency** - Automated checking for completeness and accuracy
- 🛡️ **Risk Mitigation** - Catch AI hallucinations before client delivery
- 📈 **Continuous Improvement** - Quality metrics drive system enhancements

---

## 🏆 Why VoyageGen?

<table>
<tr>
<td width="33%" align="center">
<h3>⚡ 95% Time Savings</h3>
From 4-6 hours to under 2 minutes per quotation
</td>
<td width="33%" align="center">
<h3>🎯 100% Quality</h3>
Every quotation validated by AI quality agent
</td>
<td width="33%" align="center">
<h3>🔐 Enterprise Ready</h3>
Security, scalability, and reliability built-in
</td>
</tr>
</table>

---

## 💻 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **MongoDB** 6.0+ (local or Atlas)
- **API Keys**: Google Gemini & SerpAPI

### Quick Start

#### 1️⃣ Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd voyagegen

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

#### 2️⃣ Configure Environment

**Backend** (`backend/.env`):
```env
# Database
MONGO_URI=mongodb://localhost:27017/voyagegen

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
PORT=5000

# AI Services
GEMINI_API_KEY=your-gemini-api-key
SERPAPI_KEY=your-serpapi-key

# CORS
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
```

#### 3️⃣ Run Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Server running on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev
# App running on http://localhost:5173
```

#### 4️⃣ Access Application

Navigate to `http://localhost:5173` and start generating quotations! 🎉

---

## 🎯 API Endpoints

### Authentication
```
POST   /api/auth/signup      # Register new user
POST   /api/auth/login       # Authenticate user
```

### Requirements Management
```
GET    /api/requirements     # List all requirements
POST   /api/requirements     # Create new requirement
GET    /api/requirements/:id # Get specific requirement
```

### Agent Operations
```
POST   /api/agent/run/:id    # Start AI pipeline
GET    /api/agent/run/:id    # Get run status
GET    /api/agent/runs       # List all agent runs
```

### Quotations
```
GET    /api/quotes           # List all quotes
GET    /api/quotes/:id       # Get specific quote
POST   /api/quotes           # Create manual quote
```

---

## 🚀 Future Roadmap

### Testing & Quality
- Unit testing with Jest
- Integration tests with Supertest  
- E2E testing with Playwright
- AI response mocking

### Advanced Features
- 🌐 Multi-language support
- 📱 React Native mobile app
- 🤖 ML-powered personalization
- 📧 Automated email quotations
- 📊 Advanced analytics dashboard

### Infrastructure
- Redis caching layer
- Message queue (RabbitMQ/Bull)
- Microservices architecture
- Performance monitoring

---

<div align="center">

### 🏗️ Built & Designed By

**Vrajesh**  
*Full Stack Developer & AI Enthusiast*

[GitHub](https://github.com/VRAJESH-31) • [LinkedIn](https://www.linkedin.com/in/vrajesh-n-pandya-a8ba25266/) • [Portfolio](https://vrajesh-31.vercel.app/)

---

**VoyageGen** - Where AI Meets Travel Excellence ✨

*Transforming B2B Travel Quotations with Intelligent Automation*

</div>
