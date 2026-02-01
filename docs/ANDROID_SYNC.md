# Backend → Android Synchronization Guide

**Last Updated**: February 1, 2026  
**Backend Version**: 1.0.0  
**Purpose**: Track backend changes requiring Android app updates

---

## ✅ LATEST UPDATE (Feb 1, 2026)

**🚨 USER FIELDS FIX DEPLOYED!**

**Issue Fixed:** "Missing user details" error when uploading from Android.

**What Was Wrong:**
- Backend User model was missing `phcName`, `hubName`, `blockName`, `districtName`
- Login response returned incomplete user data
- Android validation failed on upload

**What Was Fixed:**
- ✅ Added all 4 missing fields to User model
- ✅ Updated all test users with complete profile data
- ✅ Login endpoint now returns all required fields
- ✅ Database schema updated and reinitialized

**Test Result:**
```json
{
  "user": {
    "phcName": "Primary Health Center - Chennai North",  ✅
    "hubName": "Zone 3 Hub",                            ✅
    "blockName": "Teynampet Block",                     ✅
    "districtName": "Chennai"                           ✅
  }
}
```

**Android Action Required:**
1. **Logout and re-login** to fetch fresh user data
2. Try upload again - should now work!
3. See [FIX_USER_FIELDS.md](./FIX_USER_FIELDS.md) for details

---

**Panel ID Support Implemented!**

The backend now fully supports the `panelId` field along with all 6 user detail fields as requested by the Android team:
- ✅ Database schema updated with `panelId` column
- ✅ API endpoints accept and return `panelId`
- ✅ Validation for `panelId` format: `/^DPHS-\d+$/`
- ✅ File storage structure: `/uploads/{panelId}/{monthName}/{uploadId}/`
- ✅ Query support for filtering by `panelId`
- ✅ Migration script available for existing databases

**What's Ready:**
- POST /api/uploads - Accepts panelId + all user fields ✅
- GET /api/uploads - Returns panelId in responses ✅
- GET /api/uploads/:id - Includes panelId ✅
- Query filtering by panelId ✅

---

## 🔄 Change Summary

This document tracks all backend changes that require Android app updates. Review this file when syncing the Android app with the latest backend version.

---

## 📋 Current Synchronization Status

| Feature | Backend Status | Android Status | Priority | Notes |
|---------|---------------|----------------|----------|-------|
| Authentication System | ✅ Implemented | ⚠️ Needs Implementation | **HIGH** | New JWT-based auth added |
| Panel ID + User Details | ✅ Implemented | ✅ Synced | **HIGH** | Backend now supports panelId |
| User Details in Upload | ✅ Implemented | ✅ Synced | Low | Already implemented in Android |
| Upload API | ✅ Stable | ✅ Synced | Low | No changes needed |
| Health Check Endpoint | ✅ Updated | ⚠️ Check Version | Low | Now returns version info |

---

## 🔐 NEW: Authentication System (HIGH PRIORITY)

### What Changed
Backend now has a complete JWT-based authentication system. All protected routes require authentication.

### What Android Needs to Implement

#### 1. Login Screen
```kotlin
// New login endpoint
POST /api/auth/login
Content-Type: application/json

{
  "username": "healthworker1",
  "password": "password123"
}

// Response
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "healthworker1",
    "fullName": "Health Worker One",
    "role": "health_worker",
    "phoneNumber": "+1234567890",
    "hospitalName": "City General Hospital"
  }
}
```

#### 2. Token Storage
- **Store JWT token** securely (SharedPreferences with encryption or Android Keystore)
- **Token lifetime**: 24 hours (86400 seconds)
- **Store user data** locally for offline access

#### 3. Authenticated Requests
All API requests now require Authorization header:
```kotlin
// Add to all API calls
headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

#### 4. Token Validation
```kotlin
// Check if token is still valid
GET /api/auth/verify
Authorization: Bearer YOUR_JWT_TOKEN

// Response (200 OK = valid, 401 = expired/invalid)
{
  "success": true,
  "user": { /* user object */ }
}
```

#### 5. Logout
- Clear stored token from secure storage
- Clear user data from memory
- Redirect to login screen

### Protected Endpoints
These endpoints now require authentication:
- `POST /api/uploads` - Create upload
- `GET /api/uploads` - List uploads  
- `GET /api/uploads/:id` - Get upload details
- `PUT /api/uploads/:id` - Update upload
- `DELETE /api/uploads/:id` - Delete upload
- `GET /api/stats` - Get statistics
- `GET /api/auth/profile` - Get user profile

### Test Credentials
Use these for development/testing:

| Username | Password | Role | Full Name |
|----------|----------|------|-----------|
| healthworker1 | password123 | health_worker | Health Worker One |
| labtech1 | password123 | lab_tech | Lab Technician One |
| admin1 | password123 | admin | Administrator One |

---

## 📤 Upload API (Already Synced)

### Current Implementation
The upload endpoint with user details is already implemented in Android. No changes needed.

```kotlin
// Already implemented - no changes required
POST /api/uploads
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN  // ← NEW: Add this header

FormData:
- image: File
- userFullName: String
- userPhoneNumber: String
- userHospitalName: String
- testType: String (optional)
- patientId: String (optional)
- notes: String (optional)
```

**What to update**: Add Authorization header to existing upload implementation.

---

## 🏥 Health Check (Minor Update)

### What Changed
Health check endpoint now returns version information.

```kotlin
// Before
GET /api/health
// Response: { "success": true, "message": "..." }

// After (Current)
GET /api/health
// Response: { 
//   "success": true, 
//   "message": "Medical Device OCR API is running",
//   "version": "1.0.0",
//   "timestamp": 1706745600000
// }
```

**Action Required**: Update health check parser to handle new `version` and `timestamp` fields (optional - won't break if ignored).

---

## 🗄️ Database Schema

### Users Table (NEW)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,  -- Hashed with bcrypt
  fullName TEXT NOT NULL,
  role TEXT NOT NULL,  -- 'health_worker', 'lab_tech', 'admin'
  phoneNumber TEXT,
  hospitalName TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Uploads Table (Unchanged)
```sql
CREATE TABLE uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  originalname TEXT NOT NULL,
  path TEXT NOT NULL,
  size INTEGER,
  mimetype TEXT,
  userFullName TEXT,           -- Already in Android
  userPhoneNumber TEXT,         -- Already in Android
  userHospitalName TEXT,        -- Already in Android
  testType TEXT,
  patientId TEXT,
  notes TEXT,
  uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Android Impact**: No database schema changes needed. User data is fetched from login response.

---

## 🔧 Migration Checklist for Android

### Phase 1: Authentication (Required)
- [x] Create login screen UI
- [x] Implement login API call (`POST /api/auth/login`)
- [x] Set up secure token storage (SharedPreferences encrypted or Keystore)
- [x] Store user data locally
- [x] Create token refresh/validation logic
- [x] Implement logout functionality
- [x] Add splash screen to check existing token validity

### Phase 2: API Integration (Required)
- [x] Add Authorization header to all existing API calls
- [x] Handle 401 responses (token expired → redirect to login)
- [x] Test all API endpoints with authentication
- [x] Update error handling for auth failures

### Phase 3: Backend Updates (✅ COMPLETED)
- [x] Backend accepts panelId in upload requests
- [x] Backend validates panelId format (DPHS-{number})
- [x] Backend returns panelId in all responses
- [x] Backend supports query filtering by panelId
- [x] File storage uses panelId-based structure
- [x] Migration script available for existing data

### Phase 3: Backend Updates (✅ COMPLETED)
- [x] Backend accepts panelId in upload requests
- [x] Backend validates panelId format (DPHS-{number})
- [x] Backend returns panelId in all responses
- [x] Backend supports query filtering by panelId
- [x] File storage uses panelId-based structure
- [x] Migration script available for existing data

### Phase 4: User Experience (Required)
- [ ] Add loading states for login
- [ ] Display user info in app (from login response)
- [ ] Show appropriate error messages for auth failures
- [ ] Handle "remember me" / auto-login if needed
- [ ] Add session timeout handling

### Phase 5: Testing (Required)
- [ ] Test login with all 3 test users
- [ ] Test upload with authentication and panelId
- [ ] Test token expiration (wait 24 hours or manually expire)
- [ ] Test offline mode (use cached token)
- [ ] Test logout and re-login flow
- [ ] Test invalid credentials handling
- [ ] Verify panelId is correctly sent and received

### Phase 6: Optional Enhancements
- [ ] Implement biometric login (after initial login)
- [ ] Add "forgot password" flow (if backend adds it)
- [ ] Add user profile edit screen
- [ ] Cache user data for offline access
- [ ] Add token auto-refresh before expiration

---

## 🔒 Security Considerations

### For Android Implementation

1. **Token Storage**
   - ✅ DO: Use Android Keystore or encrypted SharedPreferences
   - ❌ DON'T: Store token in plain text
   - ❌ DON'T: Log token values in production

2. **Password Handling**
   - ✅ DO: Send password over HTTPS only
   - ✅ DO: Clear password from memory after login
   - ❌ DON'T: Store plain text passwords
   - ❌ DON'T: Log password values

3. **HTTPS Only**
   - ✅ DO: Use HTTPS in production (`https://your-domain.com`)
   - ⚠️ WARNING: HTTP is acceptable for local testing only (`http://localhost:3000`)

4. **Token Expiration**
   - ✅ DO: Handle 401 responses gracefully
   - ✅ DO: Redirect to login when token expires
   - ✅ DO: Clear stored data on logout

---

## 📡 API Base URL Configuration

### Development
```kotlin
const val BASE_URL = "http://localhost:3000/api"
// or "http://10.0.2.2:3000/api" for Android emulator
```

### Production
```kotlin
const val BASE_URL = "https://your-production-domain.com/api"
```

**Recommendation**: Use BuildConfig or environment variables to switch between dev/prod URLs.

---

## 🧪 Testing Endpoints

### Test Authentication
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"healthworker1","password":"password123"}'

# Verify Token
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Profile
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Upload with Auth
```bash
curl -X POST http://localhost:3000/api/uploads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test.jpg" \
  -F "userFullName=John Doe" \
  -F "userPhoneNumber=+1234567890" \
  -F "userHospitalName=Test Hospital"
```

---

## 🐛 Common Issues & Solutions

### Issue 1: 401 Unauthorized
**Cause**: Missing or invalid token  
**Solution**: Check Authorization header format: `Bearer YOUR_TOKEN`

### Issue 2: ECONNREFUSED
**Cause**: Backend server not running  
**Solution**: Start backend with `npm run dev`

### Issue 3: Token Expired
**Cause**: Token lifetime is 24 hours  
**Solution**: Re-login to get new token

### Issue 4: Android Emulator Connection
**Cause**: localhost doesn't work in Android emulator  
**Solution**: Use `10.0.2.2` instead of `localhost`

---

## 📞 Communication Protocol

### When Backend Changes
1. Backend team updates this file with change details
2. Backend team notifies Android team
3. Android team reviews changes and estimates work
4. Android team updates `SERVER_SYNC.md` on their side when complete

### When Android Needs Backend Changes
1. Android team documents request in their `SERVER_SYNC.md`
2. Android team notifies Backend team
3. Backend team implements and updates this file
4. Both teams coordinate testing

---

## 📅 Change History

| Date | Version | Changes | Android Action Required |
|------|---------|---------|------------------------|
| 2026-02-01 | 1.0.0 | ✅ Implemented panelId support in backend | Ready to use - already in Android |
| 2026-02-01 | 1.0.0 | Added JWT authentication system | Implement login, token storage, add auth headers |
| 2026-01-30 | 0.3.0 | Added user details to upload API | Already implemented ✅ |
| 2026-01-29 | 0.2.0 | Updated upload validation | Already synced ✅ |
| 2026-01-28 | 0.1.0 | Initial upload API | Already implemented ✅ |

---

## 📚 Related Documentation

- [API.md](./API.md) - Complete API reference with all endpoints
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and security layers
- [README.md](../README.md) - Backend setup and configuration

---

## ✅ Quick Sync Checklist

Before releasing Android app update:

- [x] Reviewed all HIGH priority items in this document
- [x] Backend supports panelId field (COMPLETE)
- [x] Backend validates panelId format (DPHS-{number})
- [x] Backend returns panelId in all responses
- [x] File storage uses panelId-based structure
- [x] Database migration script available
- [ ] Android team tested with updated backend
- [ ] Coordinated testing with backend team
- [ ] Verified HTTPS configuration for production

---

**Questions or Issues?**  
Contact the backend team or check the full API documentation in [docs/API.md](./API.md)
