# System Architecture

This document describes the architecture and data flow of the Medical Device OCR Backend.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Medical Device OCR System                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         │                            │                            │
         ▼                            ▼                            ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Android App   │         │   Backend API   │         │    Web UI       │
│  (Data Entry)   │ ──────► │   (Node.js)     │ ◄────── │  (Dashboard)    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │     SQLite      │
                            │    Database     │
                            └─────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Express.js Server                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │   Helmet     │    │    CORS      │    │ Rate Limiter │   Security        │
│  │  (Security)  │    │  (Origins)   │    │  (Throttle)  │   Middleware      │
│  └──────────────┘    └──────────────┘    └──────────────┘                   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                            Routes                                     │   │
│  ├──────────────┬──────────────┬──────────────┬───────────────────────┤   │
│  │  /api/auth   │  /api/upload │ /api/download│  /api/stats           │   │
│  └──────────────┴──────────────┴──────────────┴───────────────────────┘   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                          Middleware                                   │   │
│  ├──────────────┬──────────────┬──────────────────────────────────────┤   │
│  │  Validators  │ Auth Check   │  Error Handler                        │   │
│  └──────────────┴──────────────┴──────────────────────────────────────┘   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         Controllers                                   │   │
│  ├──────────────┬──────────────┬──────────────┬───────────────────────┤   │
│  │     Auth     │    Upload    │   Download   │       Stats           │   │
│  └──────────────┴──────────────┴──────────────┴───────────────────────┘   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                     Sequelize ORM (Models)                            │   │
│  ├──────────────┬──────────────┬──────────────────────────────────────┤   │
│  │    User      │    Upload    │         TestRecord                    │   │
│  └──────────────┴──────────────┴──────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                        ┌─────────────────────────┐
                        │   SQLite Database       │
                        │   (database.sqlite)     │
                        └─────────────────────────┘
```

## Request Flow

### 1. Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌────────────┐     ┌──────────┐     ┌────────┐
│ Android │────►│ Router  │────►│ Validator  │────►│Controller│────►│Database│
│   App   │     │         │     │            │     │          │     │        │
└─────────┘     └─────────┘     └────────────┘     └──────────┘     └────────┘
     │                                                   │
     │                                                   │ bcrypt.compare()
     │                                                   │ JWT.sign()
     │                                                   ▼
     │          ┌─────────────────────────────────────────────────────────┐
     │◄─────────│  { token: "eyJ...", user: { id, name, role, ... } }     │
     │          └─────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────┐
│  Store token in SharedPrefs     │
│  Cache user data locally        │
└─────────────────────────────────┘
```

### 2. Upload Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              UPLOAD FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: Android App Captures Data
─────────────────────────────────
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  OCR Capture  │────►│ Test Results  │────►│  PDF Report   │
│   (Camera)    │     │   (1-3 tests) │     │  (Generated)  │
└───────────────┘     └───────────────┘     └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   Base64 Encode   │
                    │   All Binary Data │
                    └───────────────────┘
                              │
Step 2: Send to Backend       │
─────────────────────────     ▼
                    ┌───────────────────┐
                    │   POST /api/upload │
                    │   JSON Body        │
                    └───────────────────┘
                              │
Step 3: Backend Processing    │
─────────────────────────     ▼
                    ┌───────────────────┐
                    │    Validation     │
                    │  - Required fields│
                    │  - Test types     │
                    │  - User details   │
                    └───────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   Save Files      │
                    │   to Disk         │
                    │                   │
                    │ uploads/          │
                    │  └─{userId}/      │
                    │     └─{month}/    │
                    │       └─{id}/     │
                    │         ├─PDF     │
                    │         └─Images  │
                    └───────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Create Records   │
                    │  in Database      │
                    │                   │
                    │  - Upload record  │
                    │  - TestRecord(s)  │
                    └───────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Return Success   │
                    │  Response         │
                    └───────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│        users        │
├─────────────────────┤
│ id (PK)             │
│ username (UNIQUE)   │
│ password (HASH)     │
│ name                │
│ role                │
│ email               │
│ phoneNumber         │
│ healthCenter        │
│ district            │
│ state               │
│ lastLogin           │
│ createdAt           │
│ updatedAt           │
└─────────────────────┘


┌─────────────────────┐           ┌─────────────────────┐
│       uploads       │           │    test_records     │
├─────────────────────┤           ├─────────────────────┤
│ id (PK, UUID)       │──────────►│ id (PK, UUID)       │
│ uploadTimestamp     │     1:N   │ uploadId (FK)       │
│ uploadDateTime      │           │ testName            │
│ monthName           │           │ testNumber          │
│ userId              │           │ testType            │
│ userName            │           │ testDisplayName     │
│ phcName             │           │ resultValue         │
│ hubName             │           │ unit                │
│ blockName           │           │ rawOcrText          │
│ districtName        │           │ confidence          │
│ latitude            │           │ validationTimestamp │
│ longitude           │           │ validationDateTime  │
│ pdfFileName         │           │ imageFileName       │
│ pdfUrl              │           │ imageUrl            │
│ createdAt           │           │ isValidResult       │
│ updatedAt           │           │ latitude            │
└─────────────────────┘           │ longitude           │
                                  │ createdAt           │
                                  │ updatedAt           │
                                  └─────────────────────┘
```

## File Storage Structure

```
uploads/
├── user-001/                          # User ID folder
│   ├── January 2026/                  # Month folder
│   │   ├── 550e8400-e29b-41d4.../     # Upload ID folder
│   │   │   ├── combined_report.pdf    # PDF report
│   │   │   ├── test-1.jpg             # Test image 1
│   │   │   ├── test-2.jpg             # Test image 2
│   │   │   └── test-3.jpg             # Test image 3 (if exists)
│   │   └── 660e8400-e29b-41d4.../
│   │       └── ...
│   └── February 2026/
│       └── ...
├── user-002/
│   └── ...
└── user-003/
    └── ...
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Layer 1: Network
────────────────
┌─────────────────────────────────────────────────────────────────────────────┐
│  Rate Limiting: 100 requests per 15 minutes per IP                          │
│  CORS: Configured allowed origins                                            │
└─────────────────────────────────────────────────────────────────────────────┘

Layer 2: HTTP Headers
────────────────────
┌─────────────────────────────────────────────────────────────────────────────┐
│  Helmet.js Security Headers:                                                 │
│  - Content-Security-Policy                                                   │
│  - X-Content-Type-Options                                                    │
│  - X-Frame-Options                                                           │
│  - X-XSS-Protection                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

Layer 3: Input Validation
────────────────────────
┌─────────────────────────────────────────────────────────────────────────────┐
│  express-validator:                                                          │
│  - All inputs sanitized                                                      │
│  - Type checking                                                             │
│  - Required field validation                                                 │
│  - UUID format validation                                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Layer 4: Authentication
───────────────────────
┌─────────────────────────────────────────────────────────────────────────────┐
│  JWT Tokens:                                                                 │
│  - Signed with secret key                                                    │
│  - 24-hour expiration                                                        │
│  - Contains: userId, username, role                                          │
└─────────────────────────────────────────────────────────────────────────────┘

Layer 5: Password Security
─────────────────────────
┌─────────────────────────────────────────────────────────────────────────────┐
│  bcrypt:                                                                     │
│  - Salt rounds: 10                                                           │
│  - Passwords never stored in plain text                                      │
│  - Timing-safe comparison                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Node.js v14+ | JavaScript runtime |
| Framework | Express.js 4.18 | Web framework |
| Database | SQLite 3 | Data storage |
| ORM | Sequelize 6 | Database abstraction |
| Auth | JWT + bcrypt | Authentication |
| Validation | express-validator | Input validation |
| Security | Helmet, CORS | Security headers |
| Logging | Morgan | Request logging |

## Environment Configuration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONFIGURATION HIERARCHY                              │
└─────────────────────────────────────────────────────────────────────────────┘

Priority (High to Low):
1. Environment Variables (.env)
2. Default values in config.js

┌─────────────────────────────────────────────────────────────────────────────┐
│  .env                                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  PORT=3000                                                                   │
│  NODE_ENV=development                                                        │
│  DB_DIALECT=sqlite                                                           │
│  DB_STORAGE=./database.sqlite                                                │
│  JWT_SECRET=your-secret-key                                                  │
│  JWT_EXPIRY=24h                                                              │
│  UPLOAD_DIR=./uploads                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  config/config.js                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  module.exports = {                                                          │
│    server: { port, env },                                                    │
│    database: { dialect, storage, ... },                                      │
│    jwt: { secret, expiry },                                                  │
│    upload: { directory, maxFileSize },                                       │
│    cors: { origins },                                                        │
│    rateLimit: { windowMs, maxRequests }                                      │
│  }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```
