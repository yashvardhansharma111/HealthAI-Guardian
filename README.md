---

# 🧠 Health Guardian Backend — Comprehensive API Documentation

This backend powers the **cognitive assessment engine** of the Health Guardian platform.
It delivers **clinically structured cognitive tasks**, processes user responses, and records longitudinal performance trends.

Supported Cognitive Domains:

* **Memory** (Word List Recall)
* **Attention** (Digit Span)
* **Executive Function** (Stroop)
* **Visuospatial / Mental Rotation** (if added)
* **Daily performance comparison**

Each module generates **three controlled questions**, logs accuracy, reaction times, mistakes, and timestamps, and supports **day-wise comparison for decline or improvement monitoring**.

---

# ⚙️ System Architecture & Core Technologies

- **Next.js App Router**
- **MongoDB (Mongoose ORM)**
- **Gemini API (Google Generative AI)** for question generation
- **Cookie-based JWT Authentication**
- **Global Rate Limiting (IP-based)**
- **Service / Controller / Repository Structure**

The backend follows clean, predictable patterns to ensure maintainability.

---

# 📁 Project Structure (Detailed)

```
src/
│
├── app/
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │
│       └── games/
│           ├── memory/
│           │   └── wordlist/route.ts
│           ├── attention/
│           │   └── digitspan/route.ts
│           ├── executive/
│           │   └── stroop/route.ts
│           ├── visuospatial/ (if enabled)
│           │   └── mental-rotation/route.ts
│           └── results/route.ts
│
├── controllers/
│   └── auth.controller.ts
│
├── services/
│   ├── auth.service.ts
│   ├── games/
│   │   ├── memory.service.ts
│   │   ├── attention.service.ts
│   │   ├── executive.service.ts
│   │   ├── visuospatial.service.ts   (if enabled)
│   │   └── gameResults.service.ts
│
├── repositories/
│   └── gameResults.repository.ts
│
├── middleware/
│   ├── requireAuth.ts
│   └── rateLimit.ts
│
├── utils/
│   ├── auth.ts
│   ├── gemini.ts
│   └── apiResponse.ts
│
└── config/
    └── db.ts
```

---

# 🔐 Authentication (Cookie-Based JWT Workflow)

### Login Flow:

1. User logs in through `/api/auth/login`
2. Backend:

   - verifies credentials
   - returns user data
   - sets `token` as **HttpOnly**, **Secure**, **SameSite=Lax** cookie

### Cookies remove security risks and eliminate the need for:

- Authorization headers
- Bearer tokens in requests
- Query/body tokens

### Cookie Format:

```
token=<JWT>
HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
```

### Logout:

Removes/invalidates the HttpOnly cookie.

---

# 🚫 Global Rate Limiting

Rate limiter protects the API from abuse.

**Policy:**

```
10 requests per 1 minute per IP
```

Triggered response:

```json
{
  "message": "Too many requests. Try again later.",
  "retryAfter": 110
}
```

Applies to all **game routes**.

---

# 🔌 API ENDPOINTS

---

# 1️⃣ AUTHENTICATION MODULE

---

## 🔑 POST `/api/auth/login`

Authenticates the user and issues JWT cookie.

### Request Body:

```json
{
  "email": "test@test.com",
  "password": "123456"
}
```

### Response:

```json
{
  "success": true,
  "status": 200,
  "data": {
    "user": {
      "id": "679a23a234bc",
      "name": "John Doe",
      "email": "test@test.com"
    },
    "tokenSet": true
  }
}
```

---

## 🚪 POST `/api/auth/logout`

Clears the authentication cookie.

### Response:

```json
{
  "message": "Logged out successfully"
}
```

---

# 2️⃣ MEMORY — Word List Recall

---

## 📥 GET `/api/games/memory/wordlist`

Returns **three memory tasks**, each containing:

- 8 generated nouns
- a short instruction
- recall delay
- scheduled recall timestamp

### Example Response:

```json
{
  "questions": [
    {
      "id": 1,
      "question": "Remember these words. You will be asked to recall them after 60 seconds.",
      "data": {
        "words": [
          "chair",
          "apple",
          "stone",
          "table",
          "dog",
          "tree",
          "light",
          "glass"
        ]
      },
      "meta": {
        "delaySeconds": 60,
        "scheduledAt": "2025-11-28T14:31:22.123Z"
      }
    }
  ]
}
```

---

## 📤 POST `/api/games/memory/wordlist`

### Request Body:

```json
{
  "questionId": 2,
  "shownWords": [
    "chair",
    "apple",
    "tree",
    "light",
    "stone",
    "table",
    "dog",
    "glass"
  ],
  "recalledWords": ["chair", "dog", "apple"],
  "reactionTime": 4510
}
```

### Response:

```json
{
  "result": {
    "accuracy": 0.37,
    "mistakes": ["apple", "stone", "glass"],
    "gameType": "memory_wordlist"
  }
}
```

---

# 3️⃣ ATTENTION — Digit Span

---

## 📥 GET `/api/games/attention/digitspan`

Generates **3 digit span tasks** (forward/reverse variation possible).

### Example Response:

```json
{
  "questions": [
    {
      "id": 1,
      "question": "Memorize the digits shown and repeat them in the same order.",
      "data": {
        "digits": [4, 1, 8, 2, 9, 6]
      },
      "meta": {
        "difficulty": "forward",
        "expectedResponse": "repeat in same order"
      }
    }
  ]
}
```

---

## 📤 POST `/api/games/attention/digitspan`

### Request Body:

```json
{
  "questionId": 1,
  "shownDigits": [4, 1, 8, 2, 9, 6],
  "userDigits": [4, 1, 8, 2, 9, 6],
  "reactionTime": 2120
}
```

### Response:

```json
{
  "result": {
    "accuracy": 1,
    "mistakes": [],
    "gameType": "attention_digitspan"
  }
}
```

---

# 4️⃣ EXECUTIVE FUNCTION — Stroop Task

---

## 📥 GET `/api/games/executive/stroop`

Generates **three Stroop trials**.

### Example Response:

```json
{
  "questions": [
    {
      "id": 1,
      "question": "Select the COLOR of the text, not the word itself.",
      "data": {
        "word": "blue",
        "inkColor": "red"
      },
      "meta": {
        "rule": "choose ink color",
        "interference": true
      }
    }
  ]
}
```

---

## 📤 POST `/api/games/executive/stroop`

### Request Body:

```json
{
  "questionId": 1,
  "word": "blue",
  "inkColor": "red",
  "userAnswer": "red",
  "reactionTime": 1400
}
```

### Response:

```json
{
  "result": {
    "accuracy": 1,
    "mistakes": [],
    "gameType": "executive_stroop"
  }
}
```

---

# 5️⃣ RESULTS — Day-Wise Performance Comparison

---

## 📤 POST `/api/games/results`

### Request Body:

```json
{
  "date": "2025-11-28"
}
```

### Response:

```json
{
  "today": [
    {
      "gameType": "memory_wordlist",
      "accuracy": 0.5,
      "timestamp": "2025-11-28T14:20:00Z"
    }
  ],
  "yesterday": [
    {
      "gameType": "attention_digitspan",
      "accuracy": 1,
      "timestamp": "2025-11-27T16:10:00Z"
    }
  ]
}
```

---

# 🗄 Database Model — GameResult

All cognitive tasks store results in a unified schema.

```ts
{
  userId: ObjectId,
  gameType: String,          // memory_wordlist, attention_digitspan, executive_stroop, ...
  inputData: Object,         // shown words, digits, stroop stimulus
  userResponse: Object,      // user answers
  accuracy: Number,
  reactionTime: Number,
  mistakes: [String],
  timestamp: Date
}
```

---
