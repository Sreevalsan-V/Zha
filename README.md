# Medical Device OCR Backend

A robust Node.js/Express backend server for the Medical Device OCR Android application. This system processes blood test results captured via OCR, manages user authentication, and provides a web interface for data visualization.

## 🏥 Overview

This backend serves as the central data hub for a healthcare application that:
- Captures blood test results (Glucose, Creatinine, Cholesterol) via OCR
- Associates test data with health workers and health centers
- Stores test images and generates PDF reports
- Provides analytics and statistics dashboard

## 🚀 Quick Start

### Prerequisites

- **Node.js** v14 or higher
- **npm** v6 or higher

### Installation

```bash
# Clone the repository
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Initialize database with seed users
npm run init-db

# OR migrate existing database to add panelId support
npm run migrate-panelid

# Start development server
npm run dev
```

The server will start at `http://localhost:3000`

### Default Test Users

| Username | Password | Role |
|----------|----------|------|
| `healthworker1` | `password123` | Health Worker |
| `labtech1` | `labtech123` | Lab Technician |
| `admin1` | `admin123` | Administrator |

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── config.js     # App configuration
│   │   └── database.js   # Database connection
│   ├── controllers/      # Request handlers
│   │   ├── authController.js
│   │   ├── downloadController.js
│   │   ├── statsController.js
│   │   └── uploadController.js
│   ├── database/         # Database scripts
│   │   ├── init.js       # DB initialization
│   │   └── seedUsers.js  # User seeding
│   ├── middleware/       # Express middleware
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validators.js
│   ├── models/           # Sequelize models
│   │   ├── index.js
│   │   ├── TestRecord.js
│   │   ├── Upload.js
│   │   └── User.js
│   ├── routes/           # API routes
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── downloadRoutes.js
│   │   ├── statsRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── webRoutes.js
│   ├── utils/            # Utility functions
│   │   └── ApiResponse.js
│   ├── views/            # HTML templates
│   │   ├── home.html
│   │   ├── stats.html
│   │   ├── upload-detail.html
│   │   └── uploads.html
│   └── server.js         # App entry point
├── uploads/              # Uploaded files storage
├── docs/                 # Documentation
├── .env.example          # Environment template
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/auth/profile` | Get user profile (requires auth) |
| `POST` | `/api/auth/verify` | Verify JWT token |

### Uploads

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Create new test upload |
| `GET` | `/api/uploads` | List all uploads |
| `GET` | `/api/upload/:id` | Get upload by ID |
| `DELETE` | `/api/upload/:id` | Delete upload |

### Downloads

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/download/pdf/:id` | Download PDF report |
| `GET` | `/api/download/image/:id/:testName` | Download test image |

### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Get upload statistics |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |

## 🌐 Web Interface

| Path | Description |
|------|-------------|
| `/` | Home page with navigation |
| `/uploads` | List all uploads with search |
| `/upload/:id` | Detailed view of an upload |
| `/stats` | Statistics dashboard |

## 📝 API Usage Examples

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"healthworker1","password":"password123"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "user": {
      "id": "user-001",
      "username": "healthworker1",
      "name": "Dr. Rajesh Kumar",
      "role": "Health Worker",
      "healthCenter": "Primary Health Center - Chennai North",
      "district": "Chennai",
      "state": "Tamil Nadu"
    }
  },
  "message": "Login successful",
  "timestamp": 1738339800000
}
```

### Upload Test Data

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "upload": {
      "id": "uuid-here",
      "timestamp": 1738339800000,
      "latitude": 13.082680,
      "longitude": 80.270721,
      "userId": "user-001",
      "userName": "Dr. Rajesh Kumar",
      "phcName": "PHC Chennai North",
      "hubName": "Zone 3 Hub",
      "blockName": "Teynampet Block",
      "districtName": "Chennai District",
      "monthName": "January 2026"
    },
    "tests": [
      {
        "id": "test-uuid",
        "type": "GLUCOSE",
        "value": 120.5,
        "unit": "mg/dL",
        "timestamp": 1738252200000,
        "confidence": 0.95,
        "rawText": "Glucose 120.5 mg/dL",
        "imageBase64": "base64_data_here",
        "imageType": "jpeg"
      }
    ],
    "pdfBase64": "base64_pdf_data_here"
  }'
```

## 🔧 Configuration

Environment variables (`.env`):

```env
# Server
PORT=3000
NODE_ENV=development

# Database (SQLite)
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=24h

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

## 🗃️ Database Schema

### Users Table
| Field | Type | Description |
|-------|------|-------------|
| id | STRING | Primary key |
| username | STRING | Unique login name |
| password | STRING | Bcrypt hashed |
| name | STRING | Display name |
| role | STRING | User role |
| healthCenter | STRING | Health center name |
| district | STRING | District |
| state | STRING | State |

### Uploads Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| uploadTimestamp | BIGINT | Unix timestamp |
| userId | STRING | User identifier |
| userName | STRING | User name |
| phcName | STRING | PHC name |
| hubName | STRING | Hub name |
| blockName | STRING | Block name |
| districtName | STRING | District name |
| monthName | STRING | Month folder name |
| pdfFileName | STRING | PDF file path |

### Test Records Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| uploadId | UUID | Foreign key to uploads |
| testType | ENUM | GLUCOSE, CREATININE, CHOLESTEROL |
| resultValue | FLOAT | Test result |
| unit | STRING | Measurement unit |
| confidence | FLOAT | OCR confidence |
| imageFileName | STRING | Image file path |

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot reload |
| `npm run init-db` | Initialize database and seed users |

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds of 10
- **JWT Authentication**: Stateless token-based auth
- **Input Validation**: express-validator for all inputs
- **Rate Limiting**: Prevents brute force attacks
- **Helmet**: Security headers
- **CORS**: Configured cross-origin access

## 📊 Test Types Supported

| Type | Description | Unit |
|------|-------------|------|
| GLUCOSE | Blood glucose level | mg/dL |
| CREATININE | Kidney function marker | mg/dL |
| CHOLESTEROL | Blood cholesterol | mg/dL |

## 🤝 Integration with Android App

The Android app communicates with this backend via:

1. **Login**: `POST /api/auth/login` → Stores user session locally
2. **Upload**: `POST /api/upload` → Sends test data with base64 images
3. **Sync**: `GET /api/uploads` → Retrieves upload history

## 📄 License

ISC

## 👥 Authors

Medical Device OCR Development Team
