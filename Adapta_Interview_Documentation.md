# ADAPTA — Complete Technical Documentation
### AI-Powered Task Prioritization Platform | Interview Reference

> **Stack:** React 18 · Java Spring Boot 3.2 · MongoDB · Firebase Auth · Google Gemini AI

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Frontend Architecture (React)](#4-frontend-architecture)
5. [Backend Architecture (Spring Boot)](#5-backend-architecture)
6. [Database Design (MongoDB)](#6-database-design)
7. [Authentication Flow](#7-authentication-flow)
8. [AI Features (Google Gemini)](#8-ai-features)
9. [Priority Algorithm](#9-priority-algorithm)
10. [User Profile — Team Formation Fields](#10-user-profile)
11. [REST API Reference](#11-rest-api-reference)
12. [Design Decisions & Trade-offs](#12-design-decisions)
13. [Common Interview Q&A](#13-interview-qa)

---

## 1. PROJECT OVERVIEW

**Adapta** is a full-stack, AI-driven task prioritization platform for software engineering teams. Instead of manually ordering a backlog, Adapta automatically computes a **0–100 priority score** for every task based on:

- **Impact** (business value, 1–10)
- **Effort** (implementation cost, 1–10)
- **Risk** (risk of delay, 1–10)
- **Urgency** (AI-computed from deadline proximity + project load)

### Core Problems Solved

| Problem | Adapta's Solution |
|---------|------------------|
| Engineers lose time deciding what to work on | Auto-ranked priority list always surfaced |
| Managers can't see team bandwidth | Real-time workload scores per user |
| Ad-hoc team formation causes skill mismatches | AI scorer ranks best candidates for any project |
| Empty task cards with no context | Gemini AI generates a task description from the title |

### Key Features

- ✅ Auto priority scoring formula: `(impact×8) + (risk×4) − (effort×2) + urgencyBonus`
- ✅ Deadline-aware urgency: ≤3 days → +30pts, ≤7 days → +20pts, ≤14 days → +10pts
- ✅ AI task descriptions via Google Gemini 1.5 Flash
- ✅ AI-powered semantic team formation scoring
- ✅ Kanban board per project (Todo / In Progress / Done)
- ✅ Real-time analytics: status distribution, priority breakdown, weekly burndown
- ✅ 3-step onboarding wizard capturing detailed user profiles
- ✅ Mock data fallback on every page (works without backend)

---

## 2. SYSTEM ARCHITECTURE

### High-Level Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser : 3000)                      │
│                                                                  │
│  ┌──────────────┐   ┌─────────────────────┐   ┌──────────────┐  │
│  │ Firebase SDK │   │   Axios Instance    │   │ React Router │  │
│  │ Google OAuth │   │ JWT interceptor     │   │ Client-side  │  │
│  │ Token refresh│   │ auto-attaches token │   │ routing      │  │
│  └──────┬───────┘   └──────────┬──────────┘   └──────────────┘  │
└─────────┼──────────────────────┼────────────────────────────────┘
          │ Google OAuth         │ HTTP REST + Bearer JWT
          ▼                      ▼
   ┌──────────────┐    ┌──────────────────────────────────────────┐
   │ Firebase     │    │         Spring Boot 3 (port 8080)        │
   │ Auth Service │    │                                          │
   │ (Google)     │    │  CorsFilter → FirebaseAuthFilter         │
   └──────────────┘    │      ↓ FirebasePrincipal(uid,email)      │
                       │  Controllers (Auth/Project/Task/Team/    │
                       │              Analytics)                  │
                       │      ↓                                   │
                       │  Services (Auth/Project/Task/Team/       │
                       │           Analytics/AI)                  │
                       │      ↓                                   │
                       │  Repositories (Spring Data MongoDB)      │
                       └──────────────────┬───────────────────────┘
                                          │ MongoDB Wire Protocol
                                          ▼
                       ┌──────────────────────────────────────────┐
                       │       MongoDB: database "adapta"         │
                       │   Collections: users | projects | tasks  │
                       └──────────────────────────────────────────┘
                                          ▲
                       AIService ─────────┘
                        (HTTPS REST)
                       Google Gemini 1.5 Flash API
```

### Three-Tier Architecture

| Tier | Technology | Responsibility |
|------|-----------|---------------|
| Presentation | React SPA | UI rendering, routing, auth state, API calls |
| Application | Spring Boot | Business logic, security, AI orchestration |
| Data | MongoDB | Persistence — users, projects, tasks |

Firebase Auth is a **cross-cutting concern** — it issues tokens on the client and validates them on the server. Google Gemini is called **server-side only** to keep the API key secure.

---

## 3. TECHNOLOGY STACK

| Layer | Technology | Version | Why Chosen |
|-------|-----------|---------|-----------|
| Frontend Framework | React | 18.x | Component model, hooks, huge ecosystem |
| Routing | React Router DOM | 6.x | Declarative client-side routing, dynamic params |
| HTTP Client | Axios | 1.x | Interceptors for auto-attaching JWT tokens |
| Styling | Vanilla CSS + Custom Properties | — | Full design system control, zero build overhead |
| Auth Client | Firebase Auth SDK | 10.x | Google OAuth, auto token refresh |
| Backend | Spring Boot | 3.2.4 | Production-grade REST, auto-configuration |
| Language | Java | 17 | LTS, records, type safety |
| Auth Server | Firebase Admin SDK | 9.2.0 | JWT verification, no password storage |
| Database | MongoDB | 7.x | Flexible documents, no JOINs for task queries |
| ODM | Spring Data MongoDB | 4.x | Derived query methods, zero CRUD boilerplate |
| AI | Google Gemini 1.5 Flash | — | Fast, free-tier, semantic understanding |
| Security | Spring Security | 6.x | Stateless filter chain, CORS, CSRF config |
| Font | Inter (Google Fonts) | — | Variable font, industry standard for SaaS UIs |

---

## 4. FRONTEND ARCHITECTURE

### 4.1 Folder Structure

```
frontend/src/
├── index.js                 Entry point — wraps <App> in <BrowserRouter>
├── index.css                Global design system (CSS variables)
├── App.js                   Auth-aware routing + Layout wrapper
├── services/
│   ├── api.js               Axios instance with JWT interceptor
│   └── firebase.js          Firebase SDK initialization
├── components/
│   ├── layout/
│   │   ├── Sidebar.js/css   Fixed dark sidebar with icon navigation
│   │   └── Layout.js/css    Shell: Sidebar + sticky Topbar
│   └── ui/
│       ├── TaskCard.js/css  Priority-colored task card
│       ├── StatCard.js/css  KPI metric card with trend indicator
│       ├── PriorityBadge.js Color-coded priority badge (Critical/High/Medium/Low)
│       ├── ProgressRing.js  SVG donut chart for percentages
│       ├── Modal.js/css     Accessible overlay modal
│       └── EmptyState.js    Empty list placeholder
└── pages/
    ├── Login.js             Split-screen Google auth page
    ├── Onboarding.js        3-step profile wizard
    ├── Dashboard.js         Stats + priority task list + rings + activity feed
    ├── Projects.js          Project card grid + create modal
    ├── ProjectDetail.js     3-column kanban board with task form
    ├── Analytics.js         Bar charts + donut rings + timeline
    ├── TeamFormation.js     AI team builder (skill search)
    └── styles/              Co-located CSS per page
```

### 4.2 Design System (index.css)

The entire UI is built on **CSS Custom Properties** (CSS variables) — a design token system:

```css
:root {
  --color-primary: #6366f1;        /* Indigo */
  --color-accent:  #8b5cf6;        /* Violet */
  --bg-base:       #0f172a;        /* Dark navy */
  --bg-surface:    #1e293b;        /* Card surface */
  --text-primary:  #f1f5f9;        /* Almost white */
  --space-4:       16px;           /* 4px-base spacing scale */
  --radius-lg:     10px;
  --font-family:   'Inter', sans-serif;
  --transition-base: 200ms ease;
}
```

**Why this approach:** Every component references tokens like `var(--color-primary)` — changing the theme is a single-line update. No Tailwind class names to memorize, no build step.

**Utility classes provided:** `.btn-primary`, `.btn-secondary`, `.form-control`, `.card`, `.badge`, `.chip`, `.spinner`, `.form-range`, `.toggle-switch`

### 4.3 Routing Strategy (App.js)

App.js uses a **two-tier routing strategy**:

```
Bare routes (no sidebar/topbar):
  /login       → <Login />
  /onboarding  → <Onboarding />

Layout-wrapped authenticated routes:
  /             → <Dashboard />
  /projects     → <Projects />
  /projects/:id → <ProjectDetail />   ← dynamic segment via useParams()
  /analytics    → <Analytics />
  /team         → <TeamFormation />
```

`auth.onAuthStateChanged()` — if `user === null` → redirect to `/login`. After login, `GET /auth/me` is called — if `hasProfile === false` → redirect to `/onboarding`.

### 4.4 Axios JWT Interceptor (api.js)

```javascript
api.interceptors.request.use(async (config) => {
  const user = auth?.currentUser;
  if (user) {
    const token = await user.getIdToken();  // Firebase auto-refreshes if expired
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Key point:** `getIdToken()` always returns a valid (non-expired) token — Firebase refreshes it silently every 60 minutes. The interceptor runs before every single API call automatically.

### 4.5 Pages — Detailed

| Page | Key Features |
|------|-------------|
| **Login.js** | Split-screen: dark gradient brand panel (left) + Google Sign-In form (right). `signInWithPopup(provider)` triggers Firebase OAuth. Loading spinner while auth resolves. |
| **Onboarding.js** | 3-step wizard with animated step dots + progress bar. Step 1: name/title/dept/location/timezone. Step 2: years/skills (tag chips)/certifications. Step 3: hours/week + preferences. Calls `POST /profile/complete`. |
| **Dashboard.js** | 4 KPI StatCards row → 2-column body: left=TaskCards (top 8 by priority), right=3 ProgressRings (done/active/critical %) + Recent Activity feed. `GET /tasks` with mock data fallback. |
| **Projects.js** | `grid(auto-fill, minmax(280px,1fr))` card grid. Each card: name, date, stat chips (tasks/done/completion%), gradient progress bar. "New Project" opens Modal → `POST /projects`. Optimistic insert. |
| **ProjectDetail.js** | 3-column kanban (Todo/In-Progress/Done). Tasks split by `.filter(t => t.status === col.key)`. Add Task panel with Impact/Effort/Risk sliders + AI toggle. `POST /tasks` then `PUT /tasks/prioritize`. |
| **Analytics.js** | 4 KPI stats → horizontal bar charts (status distribution + priority distribution) → weekly completions timeline → 4 donut rings sidebar. `GET /analytics/kpis`. |
| **TeamFormation.js** | Skill chip-tag input (Enter to add) + size slider (1–10). `POST /teams/suggest` → ranked candidate cards with avatar, name, email, skill chips, AI match score 0–100. |

### 4.6 UI Components

| Component | What it does |
|-----------|-------------|
| **TaskCard** | Priority-colored left border (red=Critical, orange=High, yellow=Medium, green=Low). Shows title, description (truncated), 3 metric pills (Impact/Effort/Risk), PriorityBadge, StatusBadge. |
| **StatCard** | KPI card with colored accent top bar, SVG icon, large numeric value, label, optional trend arrow (↑/↓ with %). |
| **PriorityBadge** | Maps score 0–100 to level: ≥75=Critical (red + pulsing dot), ≥50=High, ≥25=Medium, else Low. Contains StatusBadge for todo/in-progress/done/blocked. |
| **ProgressRing** | Pure SVG donut. Uses `stroke-dasharray` + `stroke-dashoffset` math to draw arc: `circumference = 2π × radius`, offset = `circumference × (1 - percent/100)`. |
| **Modal** | Backdrop blur, click-outside/Escape to close. Accepts `title`, `children`, `footer`. Sizes: sm/md/lg. |
| **EmptyState** | Centered icon + title + description + optional action button. Used everywhere lists may be empty. |

---

## 5. BACKEND ARCHITECTURE

### 5.1 Package Structure

```
com.adapta/
  AdaptaApplication.java           @SpringBootApplication entry

  config/
    FirebaseConfig.java            Loads service account JSON, initializes FirebaseApp
    SecurityConfig.java            Stateless filter chain, injects FirebaseAuthFilter
    CorsConfig.java                localhost:3000/3001 allowed, all methods/headers

  security/
    FirebaseAuthFilter.java        OncePerRequestFilter — validates Bearer JWT token
    FirebasePrincipal.java         Value object: uid, email, name, photoURL

  model/
    User.java                      @Document — embeds full profile for team formation
    Project.java                   @Document — id, name, ownerId, timestamps
    Task.java                      @Document — scoring inputs, priority, status, AI flags
    TaskStatus.java                Enum: TODO, IN_PROGRESS, DONE, BLOCKED

  repository/
    UserRepository.java            MongoRepository<User, String>
    ProjectRepository.java         findByOwnerIdOrderByCreatedAtDesc(String uid)
    TaskRepository.java            findByProjectIdOrderByPriorityDesc, countByStatus, etc.

  dto/
    ProfileRequest.java            Onboarding form payload
    TaskRequest.java               Task creation payload (impact/effort/risk/deadline/AI flags)
    TeamSuggestRequest.java        { requiredSkills: Map<String,Integer>, sizeLimit: int }

  service/
    AuthService.java               get/create user, complete profile
    ProjectService.java            list, create, getById
    TaskService.java               create (with priority + AI), reprioritizeAll, workload tracking
    TeamService.java               score users by AI, return ranked candidates
    AnalyticsService.java          countByStatus KPIs
    AIService.java                 Gemini REST API wrapper (description + scoring)

  controller/
    AuthController.java            GET /auth/me, POST /profile/complete
    ProjectController.java         GET/POST /projects, GET /projects/:id/tasks
    TaskController.java            GET/POST /tasks, PUT /tasks/prioritize
    TeamController.java            POST /teams/suggest
    AnalyticsController.java       GET /analytics/kpis
```

### 5.2 Request Lifecycle (End-to-End)

**Example: `POST /tasks` with AI description enabled**

```
1.  React: api.post('/tasks', { projectId, title, impact:9, effort:4, risk:3, generateDetails:true })
2.  Axios interceptor: attaches  Authorization: Bearer eyJhbGci...  header
3.  HTTP arrives at Spring Boot port 8080
4.  CorsFilter: validates Origin = http://localhost:3000 ✓
5.  FirebaseAuthFilter.doFilterInternal():
      → extracts token from "Bearer eyJ..."
      → FirebaseAuth.getInstance().verifyIdToken(token)
      → Google validates signature via cached public keys
      → creates FirebasePrincipal(uid, email, name, photoURL)
      → stores in SecurityContextHolder
6.  Request dispatched to TaskController.create()
7.  TaskController extracts @AuthenticationPrincipal FirebasePrincipal
8.  Calls taskService.createTask(uid, req)
9.  TaskService:
      a. Clamps: impact=9, effort=4, risk=3 (all in 1-10)
      b. urgencyBonus = computeUrgencyBonus(deadline, projectId)
            deadline in 2 days → +30
            3 in-progress tasks in project → +6
            urgencyBonus = 36
      c. priority = clamp((9×8)+(3×4)-(4×2)+36, 0, 100)
                  = clamp(72+12-8+36, 0, 100)
                  = clamp(112, 0, 100) = 100
      d. generateDetails=true → aiService.generateTaskDescription(title, seedPrompt)
            AIService builds Gemini prompt
            HTTP POST to Gemini API
            parses response: candidates[0].content.parts[0].text
            returns description string
      e. Task built with all fields; taskRepository.save(task)
      f. updateAssigneeWorkload(uid): recalculates user's workload score
10. Task returned as JSON
11. Frontend receives task, updates state, TaskCard appears in kanban
```

### 5.3 Security Design

| Aspect | Implementation |
|--------|---------------|
| Authentication | Firebase JWT Bearer token on every request |
| Session | STATELESS — no HttpSession ever created (SessionCreationPolicy.STATELESS) |
| CSRF | Disabled — not needed for stateless JWT APIs |
| Filter order | FirebaseAuthFilter runs BEFORE UsernamePasswordAuthenticationFilter |
| Token validation | Firebase Admin SDK verifies against Google's cached public keys |
| Principal | FirebasePrincipal injected via @AuthenticationPrincipal annotation |
| Missing SDK | Filter skips gracefully if Firebase not initialized (dev mode) |
| CORS | CorsFilter runs first — configurable origins via application.yml |

---

## 6. DATABASE DESIGN

### 6.1 Why MongoDB (Not SQL)?

| Factor | MongoDB | SQL (PostgreSQL) |
|--------|---------|-----------------|
| Schema flexibility | Skills/certs arrays grow — no migrations needed | ALTER TABLE for every new field |
| Query pattern | `find({projectId}).sort({priority:-1})` — no JOINs | Would JOIN users ↔ projects ↔ tasks |
| Developer speed | Derived queries auto-generated by Spring Data | Explicit SQL or ORM mapping |
| Scaling | Horizontal sharding built-in | Vertical scaling primarily |
| Document embedding | User profile embedded in user doc — 1 read | Separate profile table or JOIN |

### 6.2 Collection: `users`

```json
{
  "_id": "firebase_uid_abc123",         // Firebase UID as primary key

  "email": "sarah@adapta.io",
  "displayName": "Sarah Chen",          // from Google account
  "photoURL": "https://...",
  "hasProfile": true,                   // gate for onboarding redirect

  // ── Onboarding Profile (Step 1) ──
  "name": "Sarah Chen",
  "title": "Senior Frontend Engineer",
  "department": "Platform",
  "location": "Bengaluru, India",
  "timezone": "IST",

  // ── Skills & Experience (Step 2) ──
  "yearsTotal": 5,
  "skills": ["React", "TypeScript", "Java", "MongoDB"],
  "certifications": ["AWS Solutions Architect"],

  // ── Availability (Step 3) ──
  "availabilityHoursPerWeek": 40,
  "preferences": ["remote", "async"],

  // ── Computed by TaskService (updated on task create/update) ──
  "activeTaskCount": 2,
  "currentWorkloadScore": 40.0,         // 0-100; 100 = fully loaded

  "createdAt": "2025-12-01T10:00:00Z",
  "updatedAt": "2026-01-15T08:30:00Z"
}
```

### 6.3 Collection: `projects`

```json
{
  "_id": "5f43a...",
  "name": "Platform Redesign",
  "ownerId": "firebase_uid_abc123",     // references users._id
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-10T00:00:00Z"
}
```

### 6.4 Collection: `tasks`

```json
{
  "_id": "5f43b...",
  "projectId": "5f43a...",              // references projects._id
  "createdByUid": "firebase_uid_abc123",
  "assignedToUid": null,               // set by team formation

  "title": "Redesign authentication flow",
  "description": "Update login/signup UI...",  // may be AI-generated
  "aiGenerated": true,

  // ── Scoring inputs (1-10 each) ──
  "impact": 9,
  "effort": 4,
  "risk": 3,

  // ── Deadline ──
  "deadline": "2026-03-14",
  "estimatedHours": 16,

  // ── Computed by TaskService ──
  "priority": 100.0,                   // 0-100; descending sort key
  "urgencyBonus": 36.0,               // portion from deadline + workload

  "status": "IN_PROGRESS",             // Enum: TODO, IN_PROGRESS, DONE, BLOCKED
  "generateDetails": true,
  "seedPrompt": "Update login/signup UI to match new design system",

  "createdAt": "2026-03-10T00:00:00Z",
  "updatedAt": "2026-03-11T00:00:00Z"
}
```

### 6.5 Indexing Strategy

| Collection | Field(s) | Index Type | Purpose |
|-----------|---------|-----------|---------|
| users | email | Unique | Fast lookup; prevent duplicate accounts |
| tasks | projectId | Single | Primary filter for all task queries |
| tasks | createdByUid | Single | Dashboard — all tasks for a user |
| tasks | assignedToUid | Single | Workload tracking for team formation |
| tasks | projectId + status | Compound | `countByProjectIdAndStatus` for urgency bonus |
| projects | ownerId + createdAt | Compound | List projects ordered newest first |

### 6.6 Connection (Spring Data MongoDB)

Configured via `spring.data.mongodb.uri` in `application.yml`. Spring Boot **auto-configures** `MongoTemplate` and `MongoRepository` beans — no DataSource/SessionFactory boilerplate. Derived query methods like:

```java
List<Task> findByProjectIdOrderByPriorityDesc(String projectId);
long countByProjectIdAndStatus(String projectId, TaskStatus status);
```

…are automatically translated by Spring Data to:
```
db.tasks.find({ projectId: "..." }).sort({ priority: -1 })
db.tasks.count({ projectId: "...", status: "IN_PROGRESS" })
```

---

## 7. AUTHENTICATION FLOW

### Complete Flow (Step by Step)

```
FRONTEND                           FIREBASE                        BACKEND
   │                                  │                               │
   │─── Click "Continue with Google"─►│                               │
   │                                  │◄── Google OAuth popup ────────│
   │◄── returns FirebaseUser ─────────│                               │
   │    (uid, email, idToken JWT)     │                               │
   │                                  │                               │
   │─── GET /auth/me ─────────────────┼──── Bearer eyJhbGci... ──────►│
   │                                  │                FirebaseAuthFilter
   │                                  │                verifyIdToken(token)
   │                                  │◄──── validate signature ──────│
   │                                  │      (cached public keys)     │
   │                                  │                               │
   │◄── { uid, hasProfile: false } ───┼───────────────────────────────│
   │                                  │                               │
   │─── redirect to /onboarding ──────│                               │
   │─── POST /profile/complete ───────┼──── Bearer + ProfileRequest ─►│
   │◄── { hasProfile: true } ─────────┼───────────────────────────────│
   │─── redirect to /dashboard ───────│                               │
```

**Token auto-refresh:** Firebase SDK silently refreshes the ID Token every 60 minutes. The Axios interceptor always calls `user.getIdToken()` (not `getIdToken(false)`) which returns a valid token even if the previous one just expired.

---

## 8. AI FEATURES

### 8.1 Gemini API Integration

**Endpoint:**
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}
```

**Request:**
```json
{ "contents": [{ "parts": [{ "text": "your prompt here" }] }] }
```

**Response parsing:**
```java
root → candidates[0] → content → parts[0] → text
```

**Called from:** `AIService.java` using Spring's `RestTemplate`. Server-side only — API key never sent to browser.

**Fallback:** If API key is missing or call fails, description returns `""` and team scoring uses the mathematical formula.

### 8.2 Feature 1 — AI Task Description

**Trigger:** User enables the AI toggle when creating a task.

**Prompt built by AIService:**
```
"You are a software project manager. Write a concise 2-3 sentence task description
 for: "Redesign authentication flow".
 Additional context: Update login/signup UI to match new design.
 Be specific, professional, and actionable. Plain text only."
```

**Result:** A naturally worded, 2-3 sentence description is saved to `task.description`. Saves engineers time and ensures consistent backlog documentation.

### 8.3 Feature 2 — AI Team Formation Scoring

**Trigger:** `POST /teams/suggest { requiredSkills: {"React":1, "Java":1}, sizeLimit: 3 }`

**For each user with hasProfile=true, AIService is called:**

```
Prompt: "Score this software engineer 0-100 for a team requiring: React, Java.
 Candidate skills: React, TypeScript, Spring Boot.
 Years of experience: 5. Available hours/week: 40. Active tasks: 2.
 Consider semantic skill matches (Spring Boot counts for Java).
 Reply with ONLY the integer score 0-100."
```

**Key advantage — semantic matching:**
- `"Spring Boot"` → implicitly knows Java ✓
- `"Next.js"` → implicitly knows React ✓
- `"PostgreSQL"` → implicitly knows SQL ✓

String matching would fail all three; Gemini gets them all right.

**Fallback formula (no API key):**
```
skillMatch  = (matched skills / required skills) × 100
availScore  = (hoursPerWeek - activeTaskCount×8) / hoursPerWeek × 100
expScore    = min(yearsTotal × 10, 100)
SCORE       = (skillMatch × 0.60) + (availScore × 0.30) + (expScore × 0.10)
```

**Response:** Candidates sorted by `score` descending, each containing: id, name, email, photoURL, title, department, skills, certifications, availability, workloadScore, score.

---

## 9. PRIORITY ALGORITHM

### The Formula

```
priority = clamp(
  (impact  × 8)  +    ← Business value (dominant driver, 60%+ of score)
  (risk    × 4)  +    ← Risk of delay (needs early attention)
  (effort  × −2) +    ← Effort penalty (harder = lower priority)
  urgencyBonus        ← Deadline + project workload
, 0, 100 )
```

### Factor Weights

| Factor | Weight | Range | Rationale |
|--------|--------|-------|-----------|
| impact | ×8 | 8–80 pts | Business value is #1 driver |
| risk | ×4 | 4–40 pts | High-risk tasks need early resolution |
| effort | ×−2 | −2 to −20 | High-effort tasks are naturally slower |
| urgencyBonus | +0 to +40 | 0–40 | Time pressure overrides everything |

### Urgency Bonus Breakdown

| Condition | Points | Why |
|-----------|--------|-----|
| Deadline = today or overdue | +30 | Must be done immediately |
| Deadline ≤ 3 days | +30 | Critical window |
| Deadline ≤ 7 days | +20 | Should start today |
| Deadline ≤ 14 days | +10 | Keep an eye on it |
| No deadline | +0 | No time pressure |
| Each in-progress task in same project | +2 (max +10) | Busy project = more urgent |

### Worked Example

```
Task: "Redesign authentication flow"
  impact = 9  →  9  × 8  = 72
  risk   = 3  →  3  × 4  = 12
  effort = 4  →  4  × 2  =  8  (subtracted)
  deadline in 2 days     = +30
  project has 3 in-prog  = +6  (3×2, capped 10)
  ─────────────────────────────
  raw    = 72 + 12 − 8 + 30 + 6 = 112
  clamped to [0,100]  →  priority = 100
```

### Reprioritize All (PUT /tasks/prioritize)

Called after every task creation. Fetches all tasks, recomputes urgency (day count changes daily), batch-saves. Ensures the list always reflects **current** time pressure without any scheduled job.

```java
List<Task> all = taskRepository.findAll();
for (Task t : all) {
    double urgency = computeUrgencyBonus(t.getDeadline(), t.getProjectId());
    t.setPriority(computePriority(t.getImpact(), t.getEffort(), t.getRisk(), urgency));
}
taskRepository.saveAll(all);
```

---

## 10. USER PROFILE

### Complete Field Reference

| Field | Type | Collected In | Used For |
|-------|------|-------------|---------|
| `id` (Firebase UID) | String | Firebase JWT | Primary key; FK in tasks |
| `email` | String | Firebase | Display; unique index |
| `displayName` | String | Firebase (Google) | Fallback name before profile |
| `photoURL` | String | Firebase (Google) | Avatar in candidate cards |
| `hasProfile` | boolean | After onboarding | Gate for /onboarding redirect |
| `name` | String | Onboarding Step 1 | Display in team cards |
| `title` | String | Onboarding Step 1 | e.g. "Senior Backend Engineer" |
| `department` | String | Onboarding Step 1 | Org context |
| `location` | String | Onboarding Step 1 | Geographic context |
| `timezone` | String | Onboarding Step 1 | Async scheduling |
| `yearsTotal` | int | Onboarding Step 2 | Experience score (×10, max 100) × 0.10 |
| `skills` | String[] | Onboarding Step 2 | **PRIMARY input for AI scoring** |
| `certifications` | String[] | Onboarding Step 2 | Context for Gemini prompt |
| `availabilityHoursPerWeek` | int | Onboarding Step 3 | Availability score × 0.30 |
| `preferences` | String[] | Onboarding Step 3 | Work style (remote, async…) |
| `activeTaskCount` | int | **Computed** by TaskService | Current workload indicator |
| `currentWorkloadScore` | double | **Computed** by TaskService | 0-100; 100=fully loaded |

`activeTaskCount` and `currentWorkloadScore` are recomputed every time a task is created or updated. This ensures team formation always reflects **real-time workload**.

---

## 11. REST API REFERENCE

| Method | Endpoint | Auth | Request Body | Response |
|--------|---------|------|-------------|---------|
| GET | `/auth/me` | ✓ | — | `{ uid, hasProfile, email, name }` |
| POST | `/profile/complete` | ✓ | `ProfileRequest` | `{ success, hasProfile, uid }` |
| GET | `/projects` | ✓ | — | `Project[]` ordered by createdAt desc |
| POST | `/projects` | ✓ | `{ "name": "..." }` | `Project` |
| GET | `/projects/{id}/tasks` | ✓ | — | `Task[]` ordered by priority desc |
| GET | `/tasks` | ✓ | — | `Task[]` ordered by priority desc |
| POST | `/tasks` | ✓ | `TaskRequest` | `Task` (with computed priority) |
| PUT | `/tasks/prioritize` | ✓ | — | `{ "status": "reprioritized" }` |
| GET | `/analytics/kpis` | ✓ | — | `{ total_tasks, done, in_progress, todo, completion_pct }` |
| POST | `/teams/suggest` | ✓ | `{ requiredSkills, sizeLimit }` | `ScoredUser[]` sorted by score desc |

**All endpoints return 401 if no valid Firebase JWT is provided.**

---

## 12. DESIGN DECISIONS & TRADE-OFFS

### 1. Firebase Auth over Custom JWT
**Why:** Google OAuth, token refresh, and JWKS management handled by Firebase for free. Building equivalent infrastructure from scratch takes weeks and introduces security risks.  
**Trade-off:** Vendor lock-in. If we migrate, all tokens are void.

### 2. MongoDB over PostgreSQL
**Why:** Task and user schemas evolve frequently. MongoDB allows schema-less evolution. The primary query is `find({projectId}).sort({priority:-1})` — no JOINs needed.  
**Trade-off:** No ACID transactions across documents. Acceptable for task management.

### 3. Google Gemini over OpenAI GPT-4
**Why:** Free tier, fast (Flash variant), Google ecosystem alignment. For 2-3 sentence descriptions and 0-100 scoring, quality is equivalent.  
**Trade-off:** Slightly lower quality for complex creative tasks.

### 4. Mock Data Fallback on Every Page
**Why:** Frontend development doesn't depend on backend. Enables demos without a running backend.  
**Trade-off:** Must keep mock data in sync with the real data schema.

### 5. Vanilla CSS Design System over Tailwind
**Why:** Full control over dark-mode token system. No build step complexity. CSS variables are native browser features.  
**Trade-off:** More verbose than utility-first classes.

### 6. Stateless Spring Security
**Why:** No sticky sessions needed. Any pod can verify any JWT — horizontal scaling is trivial.  
**Trade-off:** Token revocation requires Firebase Admin `revokeRefreshTokens()`.

### 7. Priority Formula Weights (8, 4, -2)
**Why:** Impact at ×8 makes business value the dominant driver. Risk at ×4 surfaces dangerous tasks early. Effort at ×-2 is a mild penalty — high-effort valuable tasks shouldn't disappear.  
**Trade-off:** Weights are subjective — could be made configurable per organization.

---

## 13. INTERVIEW Q&A

**Q: Walk me through how authentication works in this project.**  
**A:** Firebase Auth SDK on the frontend handles Google OAuth via `signInWithPopup()`. Firebase returns a short-lived JWT (ID Token). The Axios interceptor calls `user.getIdToken()` before every API request and attaches it as `Authorization: Bearer <token>`. Firebase auto-refreshes the token every 60 minutes. On the server, `FirebaseAuthFilter` (Spring's `OncePerRequestFilter`) extracts the token and calls `FirebaseAuth.getInstance().verifyIdToken(token)` — validates signature against Google's cached public keys. Decoded claims are stored as `FirebasePrincipal` in `SecurityContextHolder`. Controllers extract it via `@AuthenticationPrincipal`. No sessions, no cookies, no database lookup per request.

---

**Q: Explain the priority algorithm.**  
**A:** `priority = clamp((impact × 8) + (risk × 4) − (effort × 2) + urgencyBonus, 0, 100)`. Impact is weighted heaviest (×8) because business value is the primary driver. Risk adds urgency (×4) since risky tasks need early attention. Effort penalizes (×−2) since costly tasks take longer. The urgencyBonus adds +30 for deadlines within 3 days, +20 within 7 days, +10 within 14 days, plus up to +10 for project busyness. `PUT /tasks/prioritize` recalculates all tasks after every creation since days-to-deadline change daily.

---

**Q: How does AI team formation work exactly?**  
**A:** When `POST /teams/suggest` is called, `TeamService` fetches all users where `hasProfile=true`. For each, it calls `AIService.scoreTeamMember()` with skills, required skills, experience, availability, and active task count. `AIService` sends a Gemini prompt asking for a 0–100 integer score. The key feature is **semantic matching** — Gemini knows "Spring Boot" implies Java, "Next.js" implies React. Without a Gemini key, it falls back to: `skillMatch×0.60 + availScore×0.30 + expScore×0.10`. Results sorted by score descending, limited to `sizeLimit`.

---

**Q: Why MongoDB and not PostgreSQL?**  
**A:** Three reasons: (1) Schema flexibility — user profiles have variable skill arrays; adding a field needs no migration. (2) Query pattern — the primary operation is `find tasks for a project, sorted by priority` — a single-collection find with no JOINs. (3) Developer speed — Spring Data MongoDB's `findByProjectIdOrderByPriorityDesc()` auto-generates the Mongo query with zero SQL. Trade-off: no ACID across documents, acceptable for task management.

---

**Q: How do you handle the backend being offline on the frontend?**  
**A:** Every page has a `MOCK_*` array at the top. The `useEffect` is wrapped in `try/catch`. If the backend is unreachable or returns empty data, the page silently uses mock data. The UI is always interactive — critical for demos and frontend development before the backend is built.

---

**Q: How would you scale this to 100,000 users?**  
**A:** Frontend: CDN (Vercel/Netlify) — already a static build. Backend: Dockerize, deploy to Kubernetes — stateless JWT means any pod handles any request. MongoDB: Atlas horizontal sharding on `projectId`. Bottleneck is `PUT /tasks/prioritize` (full collection scan) — replace with event-driven: publish `TaskCreated` event, consumer recomputes only affected tasks. Gemini API is external and scales indefinitely.

---

**Q: What is the difference between `hasProfile` and the Firebase `user` object?**  
**A:** The Firebase `user` object proves identity (uid, email) — it's set by Firebase Auth. `hasProfile` is a field in our MongoDB `users` collection indicating whether the onboarding wizard was completed (skills, title, department, etc.). A user can be authenticated (`user !== null`) but `hasProfile=false`, in which case `App.js` redirects them to `/onboarding`. This separates authentication from application-level profile completion.

---

## DEPLOYMENT CHECKLIST

### Running Locally
```bash
# 1. Start MongoDB
mongod --dbpath C:/data/db

# 2. Place Firebase service account
# → e:\Adapta\backend\firebase-service-account.json

# 3. Run backend (Terminal 1)
cd e:\Adapta\backend
set GEMINI_API_KEY=your_key_here
mvn spring-boot:run
# → http://localhost:8080

# 4. Run frontend (Terminal 2)
cd e:\Adapta\frontend
npm start
# → http://localhost:3000
```

### Environment Variables

| Variable | Service | Value |
|---------|---------|-------|
| `REACT_APP_API_URL` | Frontend | `http://localhost:8080` |
| `REACT_APP_FIREBASE_API_KEY` | Frontend | Firebase web API key |
| `MONGODB_URI` | Backend | `mongodb://localhost:27017/adapta` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Backend | `firebase-service-account.json` |
| `GEMINI_API_KEY` | Backend | Google AI Studio API key |

---

*Interview Reference Document | Adapta Project | March 2026*
