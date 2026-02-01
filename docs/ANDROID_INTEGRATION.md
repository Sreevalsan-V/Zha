# Android Integration Guide

This guide explains how to integrate the Android app with the Medical Device OCR Backend.

## Overview

The Android app communicates with the backend via REST APIs:
- **Login**: Authenticate users and store credentials locally
- **Upload**: Send test data with base64-encoded images
- **Sync**: Retrieve upload history (optional)

## Authentication

### Login Flow

```kotlin
// 1. Make login request
val loginRequest = LoginRequest(
    username = "healthworker1",
    password = "password123"
)

// 2. Call API
val response = apiService.login(loginRequest)

// 3. Store token and user data locally
if (response.success) {
    SharedPreferences.saveToken(response.data.token)
    SharedPreferences.saveUser(response.data.user)
}
```

### Login Request/Response

**Request:**
```kotlin
data class LoginRequest(
    val username: String,
    val password: String
)
```

**Response:**
```kotlin
data class LoginResponse(
    val success: Boolean,
    val data: LoginData?,
    val message: String,
    val timestamp: Long
)

data class LoginData(
    val token: String,
    val user: User
)

data class User(
    val id: String,
    val username: String,
    val name: String,
    val role: String,
    val email: String?,
    val phoneNumber: String?,
    val healthCenter: String,
    val district: String,
    val state: String
)
```

### Retrofit Service

```kotlin
interface AuthService {
    @POST("/api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
    
    @GET("/api/auth/profile")
    suspend fun getProfile(@Header("Authorization") token: String): Response<ProfileResponse>
}
```

## Upload Data

### Data Classes

```kotlin
data class UploadRequest(
    val upload: UploadInfo,
    val tests: List<TestInfo>,
    val pdfBase64: String
)

data class UploadInfo(
    val id: String,              // UUID
    val timestamp: Long,         // Unix timestamp in milliseconds
    val latitude: Double?,       // GPS latitude
    val longitude: Double?,      // GPS longitude
    val userId: String,          // User ID from login
    val userName: String,        // User name
    val phcName: String,         // Primary Health Center
    val hubName: String,         // Hub name
    val blockName: String,       // Block name
    val districtName: String,    // District name
    val monthName: String        // "January 2026" format
)

data class TestInfo(
    val id: String,              // UUID
    val type: String,            // "GLUCOSE", "CREATININE", or "CHOLESTEROL"
    val value: Double?,          // Test result value
    val unit: String,            // "mg/dL"
    val timestamp: Long,         // When test was validated
    val latitude: Double?,       // Test location
    val longitude: Double?,      // Test location
    val confidence: Float?,      // OCR confidence (0.0-1.0)
    val rawText: String?,        // Raw OCR text
    val imageBase64: String,     // Base64-encoded image
    val imageType: String        // "jpeg" or "png"
)
```

### Creating Upload Request

```kotlin
fun createUploadRequest(
    user: User,
    testRecords: List<TestRecord>,
    pdfBytes: ByteArray,
    location: Location?
): UploadRequest {
    
    val uploadId = UUID.randomUUID().toString()
    val timestamp = System.currentTimeMillis()
    
    val upload = UploadInfo(
        id = uploadId,
        timestamp = timestamp,
        latitude = location?.latitude,
        longitude = location?.longitude,
        userId = user.id,
        userName = user.name,
        phcName = user.healthCenter,
        hubName = "Zone Hub",           // From user settings
        blockName = "Block Name",        // From user settings
        districtName = user.district,
        monthName = getMonthName(timestamp)
    )
    
    val tests = testRecords.mapIndexed { index, record ->
        TestInfo(
            id = UUID.randomUUID().toString(),
            type = record.testType.name,
            value = record.resultValue,
            unit = "mg/dL",
            timestamp = record.validationTimestamp,
            latitude = record.latitude,
            longitude = record.longitude,
            confidence = record.confidence,
            rawText = record.rawOcrText,
            imageBase64 = Base64.encodeToString(record.imageBytes, Base64.NO_WRAP),
            imageType = "jpeg"
        )
    }
    
    return UploadRequest(
        upload = upload,
        tests = tests,
        pdfBase64 = Base64.encodeToString(pdfBytes, Base64.NO_WRAP)
    )
}

fun getMonthName(timestamp: Long): String {
    val formatter = SimpleDateFormat("MMMM yyyy", Locale.ENGLISH)
    return formatter.format(Date(timestamp))
}
```

### Upload Service

```kotlin
interface UploadService {
    @POST("/api/upload")
    suspend fun upload(@Body request: UploadRequest): Response<UploadResponse>
    
    @GET("/api/uploads")
    suspend fun getUploads(
        @Query("userId") userId: String? = null,
        @Query("month") month: String? = null
    ): Response<UploadsResponse>
}
```

### Upload Response

```kotlin
data class UploadResponse(
    val success: Boolean,
    val data: UploadResult?,
    val message: String,
    val timestamp: Long
)

data class UploadResult(
    val uploadId: String,
    val userId: String,
    val userName: String,
    val phcName: String,
    val uploadTime: String,
    val uploadLocation: LocationData?,
    val pdfUrl: String,
    val testsCount: Int,
    val tests: List<TestResult>
)
```

## Network Configuration

### Retrofit Setup

```kotlin
object NetworkModule {
    private const val BASE_URL = "http://192.168.1.103:3000/"
    
    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val authService: AuthService = retrofit.create(AuthService::class.java)
    val uploadService: UploadService = retrofit.create(UploadService::class.java)
}
```

### Network Security Config

For development, add to `res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.1.103</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

Add to `AndroidManifest.xml`:
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

## Offline Support

### Local Storage Strategy

```kotlin
// Store user credentials for offline login
class UserRepository(private val context: Context) {
    
    private val prefs = context.getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
    
    fun saveLoginData(token: String, user: User) {
        prefs.edit()
            .putString("token", token)
            .putString("user_id", user.id)
            .putString("user_name", user.name)
            .putString("user_role", user.role)
            .putString("health_center", user.healthCenter)
            .putString("district", user.district)
            .apply()
    }
    
    fun getUser(): User? {
        val id = prefs.getString("user_id", null) ?: return null
        return User(
            id = id,
            username = prefs.getString("username", "") ?: "",
            name = prefs.getString("user_name", "") ?: "",
            role = prefs.getString("user_role", "") ?: "",
            healthCenter = prefs.getString("health_center", "") ?: "",
            district = prefs.getString("district", "") ?: "",
            state = prefs.getString("state", "Tamil Nadu") ?: ""
        )
    }
    
    fun isLoggedIn(): Boolean = prefs.getString("token", null) != null
    
    fun logout() = prefs.edit().clear().apply()
}
```

### Queue Uploads for Offline

```kotlin
// Store uploads locally when offline
@Entity(tableName = "pending_uploads")
data class PendingUpload(
    @PrimaryKey val id: String,
    val requestJson: String,
    val createdAt: Long,
    val retryCount: Int = 0
)

// Upload when back online
class UploadSyncWorker(context: Context, params: WorkerParameters) 
    : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        val pendingUploads = database.getPendingUploads()
        
        for (upload in pendingUploads) {
            try {
                val request = gson.fromJson(upload.requestJson, UploadRequest::class.java)
                val response = uploadService.upload(request)
                
                if (response.isSuccessful) {
                    database.deletePendingUpload(upload.id)
                }
            } catch (e: Exception) {
                // Will retry on next sync
            }
        }
        
        return Result.success()
    }
}
```

## Test Types

The app supports three test types:

| Type | Enum Value | Display Name |
|------|------------|--------------|
| Blood Glucose | `GLUCOSE` | Glucose |
| Creatinine | `CREATININE` | Creatinine |
| Cholesterol | `CHOLESTEROL` | Cholesterol |

```kotlin
enum class TestType(val displayName: String) {
    GLUCOSE("Glucose"),
    CREATININE("Creatinine"),
    CHOLESTEROL("Cholesterol")
}
```

## Error Handling

```kotlin
sealed class ApiResult<out T> {
    data class Success<T>(val data: T) : ApiResult<T>()
    data class Error(val message: String, val code: Int? = null) : ApiResult<Nothing>()
    object Loading : ApiResult<Nothing>()
}

suspend fun <T> safeApiCall(apiCall: suspend () -> Response<T>): ApiResult<T> {
    return try {
        val response = apiCall()
        if (response.isSuccessful) {
            response.body()?.let {
                ApiResult.Success(it)
            } ?: ApiResult.Error("Empty response")
        } else {
            when (response.code()) {
                401 -> ApiResult.Error("Invalid credentials", 401)
                404 -> ApiResult.Error("Resource not found", 404)
                else -> ApiResult.Error("Server error: ${response.code()}", response.code())
            }
        }
    } catch (e: IOException) {
        ApiResult.Error("Network error: Check your connection")
    } catch (e: Exception) {
        ApiResult.Error("Unexpected error: ${e.message}")
    }
}
```

## Backend Server URL

Update the base URL based on your environment:

| Environment | URL |
|-------------|-----|
| Local (Emulator) | `http://10.0.2.2:3000/` |
| Local (Device) | `http://<YOUR_IP>:3000/` |
| Production | `https://your-domain.com/` |

To find your local IP:
- Windows: `ipconfig`
- Mac/Linux: `ifconfig` or `hostname -I`
