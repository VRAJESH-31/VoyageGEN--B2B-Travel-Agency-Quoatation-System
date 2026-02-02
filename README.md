# VoyageGen - B2B Travel Quotation System 🚀

VoyageGen is an intelligent, AI-powered travel quotation operating system designed to streamline the workflow of travel agents and partners. It features a modern React frontend and a robust Node.js/Express backend.

---

## 🏗️ Project Architecture (Refactored)

The project follows a clean, modular architecture:

### Backend Structure (`backend/`)

```
backend/
├── src/
│   ├── config/       # Configuration (DB, CORS, Rate Limits)
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Custom middleware (Auth, Error)
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API route definitions
│   ├── services/     # Business logic layer
│   ├── utils/        # Utilities (Logger, Response)
│   └── validators/   # Input validation schemas
├── scripts/          # Database seeders & utility scripts
└── server.js         # Entry point
```

### Frontend Structure (`frontend/`)

```
frontend/src/
├── api/              # Centralized API layer (Axios)
├── components/
│   ├── common/       # Shared UI components (Header, Footer)
│   └── features/     # Feature-specific components
├── constants/        # Global constants & routes
├── context/          # React Context (Auth)
├── hooks/            # Custom Hooks (useAuth, useApi)
├── layouts/          # Page layouts (Agent, Partner)
├── pages/            # Application pages
├── styles/           # Global styles
└── utils/            # Helper functions
```

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite, Tailwind CSS, Framer Motion, GSAP
- **Backend:** Node.js, Express, MongoDB
- **AI Integration:** Google Gemini 2.5 Flash
- **External APIs:** SerpApi (Google Hotels/Flights)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- API Keys (Google Gemini, SerpApi)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Fill in your .env values (VITE_API_URL)
npm run dev
```

### 3. Database Seeding (Optional)

```bash
cd backend
node scripts/seed.js
```

---

## 🔒 Security Features

- **JWT Authentication:** Secure stateless auth
- **Rate Limiting:** Protection against abuse
- **CORS Protection:** Restricted to frontend origin
- **Input Validation:** Backend validation layer (In Progress)

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
