# LATEST_BACKEND — VoyageGen Backend & Agent System Audit Report

---

## 0. Report Metadata

| Field | Value |
|-------|-------|
| **Project Name** | VoyageGen (B2B Travel Quotation OS) |
| **Report Name** | LATEST_BACKEND |
| **Report Date** | 2026-01-26 |
| **Backend Stack** | Node.js + Express 5.1 + Mongoose 9.0 + MongoDB |
| **Codebase Status** | MVP (Alpha) |
| **Estimated LOC** | ~2,500 lines |
| **Files Analyzed** | 34 files |

---

## 1. Executive Summary

### What the Backend Does
VoyageGen is a B2B travel quotation system that enables travel agents to receive traveler requirements, run an AI-powered multi-step pipeline, and auto-generate travel quotes with itineraries, pricing, and hotel recommendations.

### Main Modules
1. **Authentication** - JWT-based auth with RBAC (USER/AGENT/PARTNER/ADMIN)
2. **Requirements** - Traveler requirement intake and management
3. **Partners** - Partner profiles and inventory management
4. **Quotes** - Manual and AI-generated quote creation
5. **Agent Pipeline** - 5-step AI execution (Supervisor → Research → Planner → Price → Quality)

### Strengths
- ✅ Clean folder structure with separation of concerns
- ✅ Comprehensive 5-step agent pipeline with step-by-step tracking
- ✅ Standard response utilities for consistent API responses
- ✅ Rate limiting and CORS configuration
- ✅ Zod validation on agent routes
- ✅ Graceful error handling middleware
- ✅ Auto-quote generation from agent runs
- ✅ Duplicate run protection with forceRun override

### Top 10 Risks/Issues

| # | Risk | Severity | Location |
|---|------|----------|----------|
| 1 | No input validation on most routes | HIGH | requirementController, quoteController |
| 2 | JWT 30-day expiry without refresh token | MEDIUM | authController.js:6 |
| 3 | No pagination on list endpoints | MEDIUM | requirementController, quoteController |
| 4 | Requirement creation is public (no auth) | HIGH | requirementRoutes.js:12 |
| 5 | Console.log statements in production | LOW | All controllers |
| 6 | No request timeout handling in Gemini calls | MEDIUM | plannerAgentService.js |
| 7 | Missing indexes on Quote model | LOW | Quote.js |
| 8 | Fat controller pattern in quoteController | MEDIUM | quoteController.js (354 lines) |
| 9 | authLimiter not applied to agent routes | MEDIUM | agentRoutes.js |
| 10 | No audit logging for sensitive operations | LOW | All controllers |

---

## 2. Backend Architecture Overview

### Request Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Express   │────▶│ Middleware  │────▶│   Routes    │
│  (Frontend) │     │   Server    │     │(CORS/Rate/  │     │             │
└─────────────┘     └─────────────┘     │  Auth)      │     └──────┬──────┘
                                        └─────────────┘            │
                                                                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  MongoDB    │◀────│  Mongoose   │◀────│  Services   │◀────│ Controllers │
│             │     │   Models    │     │(AI/Travel/  │     │             │
└─────────────┘     └─────────────┘     │  Agents)    │     └─────────────┘
                                        └─────────────┘
```

### Error Handling Flow
```
Controller throws → error.middleware.js → Categorizes (Validation/JWT/Duplicate) → JSON Response
```

### Auth Flow
```
Login → Generate JWT (30d) → Client stores token → Bearer token in Authorization header
→ authMiddleware.protect() verifies → authMiddleware.authorize() checks role → proceed
```

### External API Flow
```
Agent Pipeline:
  RESEARCH step → PartnerInventory (DB) → If < 3 → SerpApi (Google Hotels)
  PLANNER step → Gemini AI (gemini-2.5-flash) → JSON itinerary

Quote Generation:
  SerpApi → Live hotel prices
  Gemini AI → Itinerary text generation
```

---

## 3. Folder Structure Breakdown

| Folder | Files | Responsibility | Quality |
|--------|-------|----------------|---------|
| `config/` | 4 | DB, CORS, Rate limit, Index exports | ⭐⭐⭐⭐ |
| `routes/` | 5 | API endpoint definitions | ⭐⭐⭐⭐ |
| `controllers/` | 5 | Request handling and orchestration | ⭐⭐⭐ |
| `services/` | 2 | AI and travel data services | ⭐⭐⭐ |
| `services/agents/` | 7 | Agent pipeline step services | ⭐⭐⭐⭐⭐ |
| `middleware/` | 3 | Auth, Error, Validation | ⭐⭐⭐⭐ |
| `models/` | 6 | Mongoose schemas | ⭐⭐⭐⭐ |
| `utils/` | 1 | Response formatting | ⭐⭐⭐⭐ |
| `validators/` | 1 | Zod schemas (agent only) | ⭐⭐⭐ |

### What's Missing
- `utils/logger.js` - Structured logging
- `validators/` for all routes (only agent has Zod)
- `services/emailService.js` - Notifications
- `tests/` - No test files found

---

## 4. Dependency & Package Audit

### Key Dependencies

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| express | 5.1.0 | Web framework | Latest major version |
| mongoose | 9.0.0 | MongoDB ODM | Latest major version |
| jsonwebtoken | 9.0.2 | JWT auth | Current stable |
| @google/generative-ai | 0.21.0 | Gemini AI | Current |
| zod | 4.3.6 | Schema validation | ✅ Good choice |
| express-rate-limit | 8.2.1 | Rate limiting | ✅ Configured |
| bcryptjs | 3.0.3 | Password hashing | ✅ Secure |
| axios | 1.7.9 | HTTP client | Current stable |
| serpapi | 2.2.1 | Hotel search | Current |
| cors | 2.8.5 | CORS handling | Current |

### Missing Recommended
- `helmet` - Security headers (MEDIUM priority)
- `morgan` - HTTP logging (LOW priority)
- `winston` - Structured logging (LOW priority)

### Security Notes
- ⚠️ No `helmet` for security headers
- ✅ Rate limiting configured
- ✅ CORS properly configured

---

## 5. Database (MongoDB + Mongoose) Deep Analysis

### User Model
**Path:** `src/models/User.js`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | String | Yes | - |
| email | String | Yes | Unique |
| password | String | Yes | Hashed (bcrypt) |
| role | Enum | No | USER/AGENT/PARTNER/ADMIN |
| companyName | String | No | For partners |
| destinations | [String] | No | For partners |

**Indexes:** email (implicit unique)
**Issues:** None

---

### Requirement Model
**Path:** `src/models/Requirement.js`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| destination | String | Yes | - |
| tripType | String | Yes | Honeymoon/Family/etc |
| budget | Number | Yes | - |
| startDate | Date | No | - |
| duration | Number | No | Days |
| pax.adults | Number | No | Default: 1 |
| pax.children | Number | No | Default: 0 |
| hotelStar | Number | No | 1-5 |
| preferences | [String] | No | - |
| contactInfo | Object | Partial | name/email/phone required |
| status | Enum | No | NEW/IN_PROGRESS/QUOTES_READY/SENT_TO_USER/COMPLETED |
| agentStatus | Enum | No | NEW/IN_AGENT/COMPLETED/FAILED |
| lastAgentRunId | ObjectId | No | Ref: AgentRun |
| lastAgentRunAt | Date | No | - |
| latestQuoteId | ObjectId | No | Ref: Quote |

**Indexes:** `{ agentStatus: 1, createdAt: -1 }`

---

### AgentRun Model
**Path:** `src/models/AgentRun.js`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| requirementId | ObjectId | Yes | Ref: Requirement |
| startedBy | ObjectId | Yes | Ref: User |
| status | Enum | No | PENDING/RUNNING/DONE/FAILED |
| steps | [stepSchema] | No | Array of 5 steps |
| finalResult | Mixed | No | Final itinerary JSON |
| error | String | No | - |
| meta.provider | String | No | Default: gemini |
| meta.model | String | No | Default: gemini-2.5-flash |
| quoteId | ObjectId | No | Ref: Quote |

**Step Sub-Schema:**
| Field | Type |
|-------|------|
| stepName | Enum (SUPERVISOR/RESEARCH/PLANNER/PRICE/QUALITY) |
| status | Enum (PENDING/RUNNING/DONE/FAILED) |
| startedAt | Date |
| endedAt | Date |
| logs | [String] |
| output | Mixed |
| error | String |

**Indexes:** `{ requirementId: 1, createdAt: -1 }`, `{ status: 1, createdAt: -1 }`

---

### Quote Model
**Path:** `src/models/Quote.js`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| requirementId | ObjectId | Yes | Ref: Requirement |
| partnerId | ObjectId | No | Ref: User |
| agentId | ObjectId | Yes | Ref: User |
| title | String | No | - |
| sections.hotels | Array | No | Hotel items |
| sections.transport | Array | No | Transport items |
| sections.activities | Array | No | Activity items |
| costs.net | Number | No | - |
| costs.margin | Number | No | Percentage |
| costs.final | Number | No | - |
| costs.perHead | Number | No | - |
| status | Enum | No | DRAFT/READY/SENT_TO_USER |
| itineraryText | String | No | - |
| itineraryJson | Mixed | No | Structured itinerary |
| agentRunId | ObjectId | No | Ref: AgentRun |

**Indexes:** None ⚠️
**Recommended:** `{ requirementId: 1 }`, `{ agentId: 1, createdAt: -1 }`

---

### PartnerProfile Model
**Path:** `src/models/PartnerProfile.js`

| Field | Type |
|-------|------|
| userId | ObjectId (User) |
| companyName | String |
| destinations | [String] |
| type | Enum (Hotel/CabProvider/DMC/ActivityProvider/Mixed) |
| specializations | [String] |
| budgetRange | { min, max } |
| rating | Number |
| sightSeeing | [String] |
| startingPrice | Number |

---

### PartnerInventory Models
**Path:** `src/models/PartnerInventory.js`

**PartnerHotel:**
| Field | Type |
|-------|------|
| partnerId | ObjectId |
| name, city, starRating | Basic info |
| roomTypes | [{ type, price, amenities }] |
| amenities | [String] |

**PartnerTransport / PartnerActivity:** Similar structure.

---

## 6. Authentication & Authorization (RBAC)

### JWT Configuration
- **Generation:** `jwt.sign({ id }, secret, { expiresIn: '30d' })`
- **Secret:** `process.env.JWT_SECRET`
- **Expiry:** 30 days ⚠️ (Too long for security)

### Middleware
- `protect` - Verifies JWT, attaches `req.user`
- `authorize(...roles)` - Checks `req.user.role`

### Role Matrix

| Role | Requirements | Partners | Quotes | Agent |
|------|-------------|----------|--------|-------|
| USER | Read own | - | - | - |
| AGENT | CRUD | Read/Filter | CRUD | Full access |
| PARTNER | - | Own profile/inventory | - | - |
| ADMIN | CRUD | CRUD | CRUD | Full access |

### Security Risks
| Risk | Severity | Notes |
|------|----------|-------|
| No refresh token | MEDIUM | Single long-lived token |
| No token blacklist | MEDIUM | Cannot invalidate tokens |
| No brute force protection on login | LOW | Only 5 attempts/15min via authLimiter |

---

## 7. API Routes Audit

### Auth Routes (`/api/auth`)
| Method | Endpoint | Controller | Auth | Rate Limited |
|--------|----------|------------|------|--------------|
| POST | /signup | registerUser | ❌ | ✅ authLimiter |
| POST | /login | authUser | ❌ | ✅ authLimiter |

### Requirement Routes (`/api/requirements`)
| Method | Endpoint | Controller | Auth | Roles |
|--------|----------|------------|------|-------|
| POST | / | createRequirement | ❌ | Public ⚠️ |
| GET | / | getRequirements | ✅ | AGENT, ADMIN |
| GET | /:id | getRequirementById | ✅ | USER, AGENT, ADMIN |
| PUT | /:id | updateRequirement | ✅ | AGENT, ADMIN |
| DELETE | /:id | deleteRequirement | ✅ | AGENT, ADMIN |

### Quote Routes (`/api/quotes`)
| Method | Endpoint | Controller | Auth | Roles |
|--------|----------|------------|------|-------|
| POST | /generate | generateQuotes | ✅ | AGENT, ADMIN |
| GET | / | getQuotes | ✅ | AGENT, ADMIN |
| GET | /requirement/:id | getQuotesByRequirement | ✅ | AGENT, ADMIN |
| GET | /:id | getQuoteById | ✅ | AGENT, ADMIN |
| PUT | /:id | updateQuote | ✅ | AGENT, ADMIN |
| DELETE | /:id | deleteQuote | ✅ | AGENT, ADMIN |

### Partner Routes (`/api/partners`)
| Method | Endpoint | Controller | Auth | Roles |
|--------|----------|------------|------|-------|
| GET | /me | getMyProfile | ✅ | PARTNER |
| POST | /profile | updateProfile | ✅ | PARTNER |
| POST | /inventory/:type | addInventory | ✅ | PARTNER |
| POST | /filter | filterPartners | ✅ | AGENT, ADMIN |
| POST | /fetch-hotels | fetchLiveHotels | ✅ | AGENT, ADMIN |

### Agent Routes (`/api/agent`)
| Method | Endpoint | Controller | Auth | Validated |
|--------|----------|------------|------|-----------|
| POST | /run/:requirementId | startAgentRun | ✅ | ✅ Zod |
| GET | /run/:agentRunId | getAgentRunById | ✅ | ✅ Zod |
| GET | /requirement/:requirementId/latest | getLatestAgentRunForRequirement | ✅ | ✅ Zod |

---

## 8. Controllers Deep Review

### agentController.js (~375 lines)
**Responsibilities:** Agent pipeline orchestration
**Quality:** ⭐⭐⭐⭐⭐
- ✅ Clean step-by-step execution
- ✅ Error handling per step
- ✅ Duplicate run protection
- ✅ Auto-quote creation
- ⚠️ Large function (could split into smaller handlers)

### quoteController.js (~354 lines)
**Responsibilities:** Quote CRUD + generation
**Quality:** ⭐⭐⭐
- ⚠️ Fat controller anti-pattern
- ⚠️ Complex logic in generateQuotes (should be service)
- ⚠️ Multiple DB calls without transaction
- ✅ Good error handling

### requirementController.js (~89 lines)
**Quality:** ⭐⭐⭐⭐
- ✅ Clean CRUD operations
- ⚠️ No input validation
- ⚠️ No pagination

### authController.js (~85 lines)
**Quality:** ⭐⭐⭐⭐
- ✅ Standard auth flow
- ⚠️ Debug console.logs in production

### partnerController.js (~173 lines)
**Quality:** ⭐⭐⭐⭐
- ✅ Good scoring-based filtering
- ⚠️ No pagination on filterPartners

---

## 9. Services Deep Review

### aiService.js
- Generates text itineraries using Gemini
- Returns plain text (not structured JSON)
- Used by quoteController for manual quotes

### travelDataService.js
- Fetches hotels from SerpApi (Google Hotels)
- Returns normalized hotel array
- Good error handling with empty fallback

### Agent Services (7 files)

| Service | LOC | Responsibility |
|---------|-----|----------------|
| agentRunHelpers.js | 65 | Step initialization, constants |
| supervisorAgentService.js | ~150 | Normalize requirements |
| researchAgentService.js | ~200 | Search inventory + SerpApi |
| plannerAgentService.js | ~150 | Gemini JSON itinerary |
| priceAgentService.js | ~90 | Cost calculation + margin |
| qualityAgentService.js | ~100 | Validation + auto-fix |
| agentToQuoteMapper.js | ~110 | Map AgentRun → Quote |

---

## 10. Agent System Deep Analysis

### 10.1 What "Agent" Means in VoyageGen

The "Agent" is **not** a human travel agent, but an **AI-powered automated pipeline** that:
1. Takes a traveler Requirement
2. Executes 5 sequential steps
3. Produces a ready-to-use Quote

One-click automation: Requirement → AgentRun → Quote.

### 10.2 AgentRun Model Review

```javascript
{
  requirementId: ObjectId,      // Source requirement
  startedBy: ObjectId,          // User who triggered
  status: 'RUNNING',            // PENDING/RUNNING/DONE/FAILED
  steps: [{
    stepName: 'SUPERVISOR',     // Step identifier
    status: 'DONE',             // Step status
    startedAt: Date,
    endedAt: Date,
    logs: ['message 1', 'message 2'],
    output: { ... },            // Step result
    error: null
  }, ...],                      // 5 steps total
  finalResult: { ... },         // Final itinerary JSON
  quoteId: ObjectId,            // Generated quote
  meta: { provider, model }
}
```

**Linking:**
- AgentRun → Requirement (requirementId)
- AgentRun → Quote (quoteId)
- Requirement → AgentRun (lastAgentRunId)
- Requirement → Quote (latestQuoteId)

### 10.3 Agent Pipeline Steps

#### SUPERVISOR (Step 0)
**Purpose:** Normalize and validate requirement data
**Input:** Raw Requirement document
**Output:**
```javascript
{
  normalizedParams: {
    destination: "Goa",
    budget: 100000,
    duration: 5,
    tripType: "Honeymoon",
    startDate: "2026-02-15",
    endDate: "2026-02-20",
    pax: { adults: 2, children: 0 },
    hotelStar: 4
  },
  warnings: ["Missing hotelStar, using default 4"]
}
```
**Failure:** Stops pipeline, marks FAILED

#### RESEARCH (Step 1)
**Purpose:** Find hotels from inventory + SerpApi fallback
**Input:** normalizedParams
**Output:**
```javascript
{
  hotels: [{
    name: "Taj Fort Aguada",
    pricePerNight: 8500,
    source: "PARTNER",  // or "SERPAPI"
    partnerId: "...",
    rating: 4.8,
    amenities: ["pool", "spa"]
  }],
  priceRange: { min: 4000, max: 12000 },
  suggestions: ["Peak season rates apply"],
  dataConfidence: 0.85,
  sources: { partner: 3, serpapi: 2 }
}
```
**Fallback:** If partner hotels < 3, calls SerpApi

#### PLANNER (Step 2)
**Purpose:** Generate structured JSON itinerary via Gemini
**Input:** normalizedParams + researchOutput
**Output:**
```javascript
{
  itinerary: {
    summary: "5-day honeymoon trip to Goa",
    selectedHotel: { name, pricePerNight, totalCost },
    days: [{
      dayNumber: 1,
      date: "2026-02-15",
      theme: "Arrival & Beach",
      activities: [{ time, activity, cost }],
      meals: { breakfast, lunch, dinner },
      dailyCost: 3000
    }],
    totalEstimatedCost: 85000,
    costBreakdown: { hotel, activities, transport, meals, misc },
    highlights: [...],
    notes: [...]
  },
  warnings: [],
  attempts: 1
}
```
**Retry:** Up to 2 attempts on JSON parse failure

#### PRICE (Step 3)
**Purpose:** Calculate costs, margin, per-head, budget fit
**Input:** supervisorOutput + researchOutput + plannerOutput
**Output:**
```javascript
{
  netCost: 85000,
  marginPercent: 12,
  marginAmount: 10200,
  finalCost: 95200,
  perHeadCost: 47600,
  budgetFit: true,
  originalHotel: "Taj Fort Aguada",
  adjustedHotel: null,  // Set if cheaper hotel used
  breakdown: { hotel, activities, transport, meals, misc },
  savings: 4800
}
```
**Budget Adjustment:** If finalCost > budget, tries cheaper hotels from research

#### QUALITY (Step 4)
**Purpose:** Validate itinerary and auto-fix issues
**Input:** supervisorOutput + plannerOutput + priceOutput
**Output:**
```javascript
{
  qualityScore: 85,
  issues: [],
  fixes: ["Added romantic dinner to last day"],
  passedChecks: ["days_count", "activities_exist", "budget_fit"],
  failedChecks: ["honeymoon_romantic"],
  finalItinerary: { ... },  // Fixed itinerary
  autoFixed: true
}
```
**Checks:**
- Days count = duration
- Each day has ≥2 activities
- Honeymoon has romantic activity
- finalCost ≤ budget

### 10.4 Agent APIs

#### POST /api/agent/run/:requirementId
**Flow:**
1. Validate requirementId (Zod)
2. Check duplicate run (block if RUNNING, allow if forceRun=true)
3. Create AgentRun
4. Execute SUPERVISOR → RESEARCH → PLANNER → PRICE → QUALITY
5. Create Quote from final result
6. Link Quote to AgentRun and Requirement
7. Return success with quoteId

**Response:**
```json
{
  "success": true,
  "message": "Agent run completed, quote generated",
  "data": {
    "agentRunId": "...",
    "requirementId": "...",
    "status": "DONE",
    "stepsCompleted": ["SUPERVISOR", "RESEARCH", "PLANNER", "PRICE", "QUALITY"],
    "quoteId": "...",
    "finalCost": 95200,
    "budgetFit": true,
    "qualityScore": 85
  }
}
```

#### GET /api/agent/run/:agentRunId
Returns full AgentRun with all step details

#### GET /api/agent/requirement/:requirementId/latest
Returns latest AgentRun for the requirement

### 10.5 Agent Observability

**What is Logged:**
- Step start/end timestamps
- Step-specific logs (array of strings)
- Errors per step
- Warnings

**What is Missing:**
- ⚠️ No requestId for tracing
- ⚠️ No Gemini token usage tracking
- ⚠️ No cost tracking (API costs)
- ⚠️ No structured log format (JSON logs)

### 10.6 Agent Data Contracts

See sections above for complete schemas:
- Supervisor Output: normalizedParams + warnings
- Research Output: hotels + priceRange + confidence
- Planner Output: itinerary JSON (days, costs, etc.)
- Price Output: netCost, margin, finalCost, budgetFit
- Quality Output: qualityScore, issues, fixes, finalItinerary

### 10.7 Failure Modes + Recovery

| Failure | Current Handling | Recovery |
|---------|------------------|----------|
| SerpApi down | Return empty, low confidence | Use partner inventory only |
| Gemini invalid JSON | Retry once | Mark FAILED after 2 attempts |
| DB save failure | Catch and fail step | Pipeline stops |
| Missing inventory | Empty hotels array | SerpApi fallback |
| Budget mismatch | Price step adjusts hotel | Flag if still over |
| Duplicate run | Block with 409 | Use forceRun=true |

### 10.8 Security & Abuse Risks

| Risk | Current Status | Recommendation |
|------|----------------|----------------|
| Rate limiting | ❌ Not on agent routes | Add 10 req/min for /agent |
| Duplicate protection | ✅ Implemented | Good |
| Input validation | ✅ Zod on params | Good |
| PII exposure | ⚠️ Contact info in logs | Sanitize logs |
| Prompt injection | ⚠️ No sanitization | Escape user input in prompts |

### 10.9 Recommended MVP-Safe Improvements

1. Add rate limiting to agent routes (5-10 req/min)
2. Add timeout to Gemini calls (30s max)
3. Sanitize logs (remove PII)
4. Add requestId to AgentRun for tracing
5. Log Gemini token usage in meta

---

## 11. Quote System Integration Review

### Quote Creation Methods
1. **Manual:** POST /api/quotes/generate (quoteController)
2. **Auto:** Agent pipeline creates via agentToQuoteMapper

### Quote Fields from Agent
| Quote Field | Agent Source |
|-------------|--------------|
| requirementId | AgentRun.requirementId |
| agentId | AgentRun.startedBy |
| partnerId | PRICE.selectedHotel.partnerId (if PARTNER) |
| sections | Mapped from itinerary days |
| costs | PRICE step output |
| itineraryJson | QUALITY.finalItinerary |
| itineraryText | Generated from JSON |
| agentRunId | AgentRun._id |
| status | 'READY' |

### PDF Dependencies
Not found in current codebase. Likely handled by frontend or external service.

---

## 12. Validation Layer Review

### Current State

| Route Group | Validation | Library |
|-------------|------------|---------|
| Agent | ✅ Full | Zod |
| Auth | ❌ Manual only | - |
| Requirements | ❌ Manual only | - |
| Quotes | ❌ Manual only | - |
| Partners | ❌ Manual only | - |

### Recommended Actions
1. Create `validators/authValidators.js` (email, password strength)
2. Create `validators/requirementValidators.js` (all fields)
3. Create `validators/quoteValidators.js` (sections, costs)
4. Apply validateRequest middleware to all routes

---

## 13. Error Handling & Response Standardization

### Global Error Handler
**File:** `middleware/error.middleware.js`
**Handles:**
- Mongoose ValidationError → 400
- Duplicate key (11000) → 400
- JWT errors → 401
- Default → 500

### Response Format
```javascript
// Success
{ success: true, message: "...", data: {...} }

// Error
{ success: false, message: "...", errors: [...] }
```

### Issues
- ⚠️ Some controllers return non-standard format (raw `res.json()`)
- ⚠️ Error messages leak stack traces in dev mode

---

## 14. Security Audit

| Issue | Severity | Location | Impact | Fix |
|-------|----------|----------|--------|-----|
| Public requirement creation | HIGH | requirementRoutes.js:12 | Spam risk | Add rate limit or captcha |
| No helmet headers | MEDIUM | server.js | XSS, clickjacking | Add helmet middleware |
| 30-day JWT expiry | MEDIUM | authController.js:6 | Token theft window | Reduce to 7d + refresh token |
| No input sanitization | MEDIUM | All controllers | NoSQL injection possible | Use mongo-sanitize |
| Console.log in prod | LOW | All controllers | Info leakage | Use proper logger |
| No audit logging | LOW | All | No accountability | Add audit log service |

---

## 15. Performance & Scalability

### N+1 Query Risks
- ⚠️ `filterPartners` - Loops through partners without batch
- ⚠️ `generateQuotes` - Multiple partner queries in loop

### Missing Pagination
- `/api/requirements` - Returns all
- `/api/quotes` - Returns all
- `/api/partners/filter` - Returns all

### Caching Candidates
- Partner profiles (rarely change)
- SerpApi results (cache 1 hour)
- Gemini itinerary templates

### Async Parallelization
- Agent steps are sequential (required)
- Quote generation could batch partner queries

---

## 16. Final Recommendations (Prioritized)

### P0 (Must Fix Now)
1. **Add rate limiting to agent routes** - Prevent abuse
   - Effort: 30 min
2. **Add helmet middleware** - Security headers
   - Effort: 15 min
3. **Validate public requirement endpoint** - Prevent spam
   - Effort: 1 hour

### P1 (Next Sprint)
1. **Add Zod validation to all routes** - Comprehensive input validation
   - Effort: 4 hours
2. **Add pagination to list endpoints** - Performance
   - Effort: 2 hours
3. **Reduce JWT expiry to 7 days + add refresh token** - Security
   - Effort: 3 hours

### P2 (Later)
1. **Extract quote generation logic to service** - Clean architecture
   - Effort: 4 hours
2. **Add structured logging (winston)** - Observability
   - Effort: 3 hours
3. **Add unit tests for agent services** - Quality
   - Effort: 8 hours

---

## 17. Appendix

### Endpoint Summary

| Module | Endpoints | Protected |
|--------|-----------|-----------|
| Auth | 2 | 0 |
| Requirements | 5 | 4 |
| Quotes | 6 | 6 |
| Partners | 5 | 5 |
| Agent | 3 | 3 |
| **Total** | **21** | **18** |

### Model Summary

| Model | Fields | Indexes | Relations |
|-------|--------|---------|-----------|
| User | 6 | 1 | - |
| Requirement | 14 | 1 | AgentRun, Quote |
| AgentRun | 8 | 2 | Requirement, Quote |
| Quote | 12 | 0 | Requirement, AgentRun, User |
| PartnerProfile | 10 | 0 | User |
| PartnerInventory | 3 models | 0 | User |

### Agent Step Summary

| Step | Index | Service | External API |
|------|-------|---------|--------------|
| SUPERVISOR | 0 | supervisorAgentService | - |
| RESEARCH | 1 | researchAgentService | SerpApi |
| PLANNER | 2 | plannerAgentService | Gemini |
| PRICE | 3 | priceAgentService | - |
| QUALITY | 4 | qualityAgentService | - |

---

**Report Generated:** 2026-01-26 01:53 IST
**Auditor:** Claude (Senior Backend Architect)
