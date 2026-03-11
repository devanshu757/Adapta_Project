# Adapta Backend

Java Spring Boot 3 REST API for the Adapta Task Prioritization Application.

## Stack
- **Java 17** + **Spring Boot 3.2**
- **MongoDB** (local or Atlas)
- **Firebase Admin SDK** — JWT authentication
- **Google Gemini 1.5 Flash** — AI task descriptions & team scoring

---

## Setup

### 1. Prerequisites
```bash
# Java 17+
java -version

# Maven 3.8+
mvn -version

# MongoDB running locally (or set MONGODB_URI env to Atlas connection string)
```

### 2. Firebase Service Account
1. Go to [Firebase Console](https://console.firebase.google.com) → Project Settings → Service Accounts
2. Click **Generate new private key** — download the JSON file
3. Place it at `backend/firebase-service-account.json`

### 3. Gemini API Key *(optional — AI features)*
1. Get a free key from [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. Add to `application.yml` or set env var:
```bash
set GEMINI_API_KEY=your_key_here
```

### 4. Run
```bash
cd backend
mvn spring-boot:run
```
Server starts on **http://localhost:8080**

---

## API Endpoints

| Method | Path                     | Description                            |
|--------|--------------------------|----------------------------------------|
| GET    | `/auth/me`               | Get current user + hasProfile flag     |
| POST   | `/profile/complete`      | Save full user profile (onboarding)    |
| GET    | `/projects`              | List projects for current user         |
| POST   | `/projects`              | Create a new project                   |
| GET    | `/projects/{id}/tasks`   | Tasks for a project (sorted by priority)|
| GET    | `/tasks`                 | All tasks for current user             |
| POST   | `/tasks`                 | Create task (AI description optional)  |
| PUT    | `/tasks/prioritize`      | Recalculate all task priorities        |
| GET    | `/analytics/kpis`        | Task counts and completion %           |
| POST   | `/teams/suggest`         | AI-ranked team member suggestions      |

---

## Priority Algorithm

```
priority = clamp( (impact×8) + (risk×4) − (effort×2) + urgencyBonus , 0, 100 )

urgencyBonus:
  deadline ≤ 3  days  → +30
  deadline ≤ 7  days  → +20
  deadline ≤ 14 days  → +10
  no deadline         →  0
  + (in-progress tasks in project × 2, max +10)
```

## Team Formation Scoring

```
score = skillMatch(60%) + availability(30%) + experience(10%)
```
- **skillMatch**: % of required skills matched (Gemini does semantic matching)
- **availability**: (availabilityHours − activeTaskCount×8) / availabilityHours
- **experience**: min(yearsTotal × 10, 100)

Falls back to string-match scoring if Gemini API key is not set.

---

## User Profile Fields (for Team Formation)

| Field | Type | Purpose |
|-------|------|---------|
| `name`, `email`, `photoURL` | String | Identity |
| `title`, `department`, `location`, `timezone` | String | Role context |
| `yearsTotal` | int | Experience score |
| `skills` | String[] | Skill match scoring |
| `certifications` | String[] | Qualification context |
| `availabilityHoursPerWeek` | int | Capacity scoring |
| `preferences` | String[] | Work style (remote, async…) |
| `activeTaskCount` | int | Computed: current workload |
| `currentWorkloadScore` | double | 0-100 (100 = fully loaded) |
