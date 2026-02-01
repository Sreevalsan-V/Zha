# API Reference

Complete API documentation for the Medical Device OCR Backend.

## Base URL

```
http://localhost:3000/api
```

## Response Format

All API responses follow this structure:

```json
{
  "success": true | false,
  "data": { ... } | null,
  "message": "Description of result",
  "timestamp": 1738339800000
}
```

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid credentials |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error |

---

## Authentication

### POST /api/auth/login

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "username": "healthworker1",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-001",
      "username": "healthworker1",
      "name": "Dr. Rajesh Kumar",
      "role": "Health Worker",
      "email": "rajesh.kumar@dpha.tn.gov.in",
      "phoneNumber": "+91 9876543210",
      "healthCenter": "Primary Health Center - Chennai North",
      "district": "Chennai",
      "state": "Tamil Nadu"
    }
  },
  "message": "Login successful",
  "timestamp": 1738339800000
}
```

**Error Response (401):**
```json
{
  "success": false,
  "data": null,
  "message": "Invalid username or password",
  "timestamp": 1738339800000
}
```

---

### GET /api/auth/profile

Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-001",
    "username": "healthworker1",
    "name": "Dr. Rajesh Kumar",
    "role": "Health Worker",
    "email": "rajesh.kumar@dpha.tn.gov.in",
    "phoneNumber": "+91 9876543210",
    "healthCenter": "Primary Health Center - Chennai North",
    "district": "Chennai",
    "state": "Tamil Nadu"
  },
  "message": "Profile retrieved successfully",
  "timestamp": 1738339800000
}
```

---

### POST /api/auth/verify

Verify if a JWT token is valid.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user-001",
    "username": "healthworker1",
    "name": "Dr. Rajesh Kumar"
  },
  "message": "Token is valid",
  "timestamp": 1738339800000
}
```

---

## Uploads

### POST /api/upload

Create a new test upload with images and PDF.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "upload": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": 1738339800000,
    "latitude": 13.082680,
    "longitude": 80.270721,
    "panelId": "DPHS-1",
    "userId": "user-001",
    "userName": "Dr. Rajesh Kumar",
    "phcName": "Primary Health Center - Chennai North",
    "hubName": "Zone 3 Hub",
    "blockName": "Teynampet Block",
    "districtName": "Chennai District",
    "monthName": "January 2026"
  },
  "tests": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "type": "GLUCOSE",
      "value": 120.5,
      "unit": "mg/dL",
      "timestamp": 1738252200000,
      "latitude": 13.082500,
      "longitude": 80.270500,
      "confidence": 0.95,
      "rawText": "Glucose 120.5 mg/dL",
      "imageBase64": "<base64-encoded-image>",
      "imageType": "jpeg"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "type": "CREATININE",
      "value": 1.2,
      "unit": "mg/dL",
      "timestamp": 1738252300000,
      "confidence": 0.92,
      "rawText": "Creatinine 1.2 mg/dL",
      "imageBase64": "<base64-encoded-image>",
      "imageType": "jpeg"
    }
  ],
  "pdfBase64": "<base64-encoded-pdf>"
}
```

**Test Types (1-3 per upload):**
- `GLUCOSE` - Blood glucose level
- `CREATININE` - Kidney function marker
- `CHOLESTEROL` - Blood cholesterol level

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "uploadId": "550e8400-e29b-41d4-a716-446655440000",
    "panelId": "DPHS-1",
    "userId": "user-001",
    "userName": "Dr. Rajesh Kumar",
    "phcName": "Primary Health Center - Chennai North",
    "uploadTime": "30 Jan 2026, 2:30 PM",
    "uploadLocation": {
      "latitude": 13.082680,
      "longitude": 80.270721
    },
    "pdfUrl": "/api/download/pdf/550e8400-e29b-41d4-a716-446655440000",
    "testsCount": 2,
    "tests": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "testType": "GLUCOSE",
        "displayName": "Glucose",
        "value": 120.5,
        "unit": "mg/dL",
        "imageUrl": "/api/download/image/550e8400.../test-1"
      }
    ]
  },
  "message": "Upload successful",
  "timestamp": 1738339800000
}
```

---

### GET /api/uploads

Get list of all uploads with optional filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| panelId | string | Filter by panel ID (e.g., "DPHS-1") |
| userId | string | Filter by user ID |
| startDate | number | Start timestamp |
| endDate | number | End timestamp |
| month | string | Filter by month name |

**Example:**
```
GET /api/uploads?panelId=DPHS-1&month=January%202026
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "uploads": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "uploadTimestamp": 1738339800000,
        "uploadDateTime": "30 Jan 2026, 2:30 PM",
        "monthName": "January 2026",
        "userId": "user-001",
        "userName": "Dr. Rajesh Kumar",
        "phcName": "Primary Health Center - Chennai North",
        "testsCount": 2,
        "testTypes": ["GLUCOSE", "CREATININE"],
        "pdfUrl": "/api/download/pdf/550e8400..."
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  },
  "message": "Uploads retrieved successfully",
  "timestamp": 1738339800000
}
```

---

### GET /api/upload/:id

Get detailed information about a specific upload.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Upload ID |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "uploadTimestamp": 1738339800000,
    "uploadDateTime": "30 Jan 2026, 2:30 PM",
    "monthName": "January 2026",
    "userId": "user-001",
    "userName": "Dr. Rajesh Kumar",
    "phcName": "Primary Health Center - Chennai North",
    "hubName": "Zone 3 Hub",
    "blockName": "Teynampet Block",
    "districtName": "Chennai District",
    "latitude": 13.082680,
    "longitude": 80.270721,
    "pdfUrl": "/api/download/pdf/550e8400...",
    "tests": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "testNumber": 1,
        "testType": "GLUCOSE",
        "testDisplayName": "Glucose",
        "resultValue": 120.5,
        "unit": "mg/dL",
        "confidence": 0.95,
        "rawOcrText": "Glucose 120.5 mg/dL",
        "validationTimestamp": 1738252200000,
        "validationDateTime": "30 Jan 2026, 10:00 AM",
        "imageUrl": "/api/download/image/550e8400.../test-1",
        "latitude": 13.082500,
        "longitude": 80.270500
      }
    ]
  },
  "message": "Upload retrieved successfully",
  "timestamp": 1738339800000
}
```

---

### DELETE /api/upload/:id

Delete an upload and all associated files.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Upload ID |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "deletedId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "message": "Upload deleted successfully",
  "timestamp": 1738339800000
}
```

---

## Downloads

### GET /api/download/pdf/:id

Download the PDF report for an upload.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Upload ID |

**Response:** PDF file download

---

### GET /api/download/image/:id/:testName

Download a specific test image.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Upload ID |
| testName | string | Test file name (e.g., "test-1") |

**Response:** Image file download (JPEG/PNG)

---

## Statistics

### GET /api/stats

Get upload statistics and analytics.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | Filter by user ID |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalUploads": 150,
      "totalTests": 420,
      "uniqueUsers": 12,
      "todayUploads": 5
    },
    "byTestType": {
      "GLUCOSE": 180,
      "CREATININE": 140,
      "CHOLESTEROL": 100
    },
    "byMonth": [
      { "month": "January 2026", "count": 50 },
      { "month": "December 2025", "count": 100 }
    ],
    "recentActivity": [
      {
        "date": "2026-01-30",
        "uploads": 5,
        "tests": 12
      }
    ]
  },
  "message": "Statistics retrieved successfully",
  "timestamp": 1738339800000
}
```

---

## Health Check

### GET /api/health

Check if the server is running.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Medical Device OCR API is running",
  "version": "1.0.0",
  "timestamp": 1738339800000
}
```
