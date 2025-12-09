# 🔌 API Reference - Pubbs Bike Sharing

Complete API documentation for backend integration and development.

---

## 🔑 Authentication

All protected endpoints require user authentication via Firebase Auth tokens or session cookies.

### Register User
```http
POST /api/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phoneNumber": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "user_123abc",
  "message": "User registered successfully"
}
```

**Error Codes:**
- `400` - Invalid input / Missing fields
- `409` - Email already exists
- `500` - Server error

---

### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "user_123abc",
    "email": "john@example.com",
    "phoneNumber": "+919876543210",
    "fullName": "John Doe"
  },
  "token": "firebase_auth_token..."
}
```

---

### Send OTP
```http
POST /api/send-otp
Content-Type: application/json

{
  "phoneNumber": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "requestId": "msg91_request_id"
}
```

---

### Verify OTP
```http
POST /api/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "message": "Phone number verified"
}
```

---

## 🚴 Bike Operations

### Get Bike Details
```http
GET /api/bikes?bikeId=BIKE001&operator=PubbsTesting
```

**Response:**
```json
{
  "success": true,
  "bike": {
    "id": "BIKE001",
    "bikeId": "BIKE001",
    "status": "idle",
    "operation": "0",
    "battery": "87",
    "ridetime": "480",
    "type": "QTGSM",
    "location": {
      "latitude": 22.3149,
      "longitude": 87.3105
    },
    "stationId": "STATION01"
  }
}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bikeId` | string | Yes | Unique bike identifier |
| `operator` | string | Yes | Operator name (e.g., "PubbsTesting") |

---

### Update Bike Operation
```http
POST /api/bike-operation
Content-Type: application/json

{
  "bikeId": "BIKE001",
  "operator": "PubbsTesting",
  "operation": "1",
  "status": "busy",
  "battery": "87",
  "ridetime": "480"
}
```

**Operation Codes:**
| Code | Status | Description |
|------|--------|-------------|
| `"0"` | `"idle"` | Locked, available |
| `"1"` | `"busy"` | Unlock request |
| `"10"` | `"busy"` | Unlocked |
| `"2"` | `"hold"` | Hold request |
| `"20"` | `"hold"` | On hold |
| `"3"` | `"busy"` | Continue request |
| `"30"` | `"busy"` | Riding |

**Response:**
```json
{
  "success": true,
  "message": "Bike operation updated successfully"
}
```

---

### Get Available Bikes
```http
GET /api/bikes/available?stationId=STATION01&operator=PubbsTesting
```

**Response:**
```json
{
  "success": true,
  "bikes": [
    {
      "id": "BIKE001",
      "status": "idle",
      "battery": "87",
      "type": "QTGSM",
      "location": {
        "latitude": 22.3149,
        "longitude": 87.3105
      }
    }
  ],
  "count": 1
}
```

---

## 📍 Stations

### Get All Stations
```http
GET /api/stations?operator=PubbsTesting
```

**Response:**
```json
{
  "success": true,
  "stations": [
    {
      "id": "STATION01",
      "name": "IIT KGP Main Gate",
      "location": {
        "lat": 22.3149,
        "lng": 87.3105
      },
      "availableBikes": 5,
      "capacity": 10,
      "geofence": {
        "center": { "lat": 22.3149, "lng": 87.3105 },
        "radius": 500
      }
    }
  ]
}
```

---

## 🎫 Bookings & Rides

### Create Trip
```http
POST /api/create-trip
Content-Type: application/json

{
  "userId": "user_123abc",
  "bikeId": "BIKE001",
  "operator": "PubbsTesting",
  "startLocation": {
    "latitude": 22.3149,
    "longitude": 87.3105
  },
  "bookingId": "BOOK_1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "tripId": "TRIP_abc123",
  "bookingId": "BOOK_1234567890",
  "startTime": "2025-10-10T10:30:00Z",
  "message": "Trip created successfully"
}
```

---

### Get Active Ride
```http
GET /api/user-ride?userId=user_123abc&operator=PubbsTesting
```

**Response:**
```json
{
  "success": true,
  "activeRide": {
    "bookingId": "BOOK_1234567890",
    "bikeId": "BIKE001",
    "startTime": "2025-10-10T10:30:00Z",
    "holdStartTime": null,
    "totalHoldTime": 0,
    "status": "active"
  }
}
```

**If no active ride:**
```json
{
  "success": true,
  "activeRide": null
}
```

---

### End Ride
```http
POST /api/booking/end
Content-Type: application/json

{
  "bookingId": "BOOK_1234567890",
  "userId": "user_123abc",
  "bikeId": "BIKE001",
  "operator": "PubbsTesting",
  "endLocation": {
    "latitude": 22.3200,
    "longitude": 87.3150
  }
}
```

**Response:**
```json
{
  "success": true,
  "tripDetails": {
    "bookingId": "BOOK_1234567890",
    "duration": 1800,
    "distance": 3.5,
    "cost": 10,
    "startTime": "2025-10-10T10:30:00Z",
    "endTime": "2025-10-10T11:00:00Z"
  },
  "message": "Ride ended successfully"
}
```

---

## 💳 Subscriptions

### Get User Subscription
```http
GET /api/subscriptions?userId=user_123abc
```

**Response:**
```json
{
  "success": true,
  "subscription": {
    "userId": "user_123abc",
    "planType": "monthly",
    "startDate": "2025-10-01T00:00:00Z",
    "endDate": "2025-11-01T00:00:00Z",
    "isActive": true,
    "amount": 150,
    "autoRenew": true
  }
}
```

---

### Create Subscription Order
```http
POST /api/subscriptions/create
Content-Type: application/json

{
  "userId": "user_123abc",
  "planType": "monthly",
  "amount": 150,
  "duration": 30
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_123abc",
  "razorpayOrderId": "order_Abcd1234567890",
  "amount": 150,
  "currency": "INR"
}
```

---

### Verify Payment
```http
POST /api/razorpay/verify
Content-Type: application/json

{
  "razorpay_order_id": "order_Abcd1234567890",
  "razorpay_payment_id": "pay_Xyz9876543210",
  "razorpay_signature": "signature_hash..."
}
```

**Response:**
```json
{
  "success": true,
  "subscription": {
    "userId": "user_123abc",
    "planType": "monthly",
    "startDate": "2025-10-10T00:00:00Z",
    "endDate": "2025-11-10T00:00:00Z",
    "isActive": true,
    "paymentId": "pay_Xyz9876543210"
  },
  "message": "Payment verified and subscription activated"
}
```

---

## 🔧 Admin Operations

### Get System Metrics
```http
GET /api/admin/metrics?operator=PubbsTesting
Authorization: Bearer admin_token
```

**Response:**
```json
{
  "success": true,
  "metrics": {
    "totalBikes": 50,
    "activeBikes": 12,
    "idleBikes": 35,
    "maintenanceBikes": 3,
    "totalUsers": 1250,
    "activeRides": 12,
    "revenue": {
      "today": 5420,
      "thisMonth": 148300
    }
  }
}
```

---

### Get Lock Commands
```http
GET /api/locks/commands?operator=PubbsTesting&bikeId=BIKE001
Authorization: Bearer admin_token
```

**Response:**
```json
{
  "success": true,
  "commands": [
    {
      "id": "cmd-1728567890-abc123",
      "bikeId": "BIKE001",
      "userId": "user_123abc",
      "command": "unlock",
      "timestamp": 1728567890000,
      "status": "success",
      "responseTime": 1250
    }
  ]
}
```

---

## 🔒 Lock Control

### Unlock Bike (Direct)
```http
POST /api/locks/unlock
Content-Type: application/json
Authorization: Bearer admin_token

{
  "operator": "PubbsTesting",
  "bikeId": "BIKE001",
  "userId": "admin_user",
  "qrCode": "BIKE001"
}
```

**Response:**
```json
{
  "success": true,
  "unlockCode": "ABC123",
  "message": "Bike unlocked successfully"
}
```

---

## 🚨 Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

**Common Error Codes:**
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_INPUT` | 400 | Missing or invalid parameters |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `BIKE_UNAVAILABLE` | 422 | Bike not available for operation |
| `NO_ACTIVE_SUBSCRIPTION` | 402 | User needs active subscription |
| `PAYMENT_FAILED` | 402 | Payment processing failed |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 🔄 Webhooks

### Razorpay Payment Webhook
```http
POST /api/razorpay/webhook
Content-Type: application/json
X-Razorpay-Signature: signature_hash...

{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_Xyz9876543210",
        "amount": 15000,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_Abcd1234567890"
      }
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

---

## 📊 Rate Limiting

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| `/api/login` | 5 requests | 15 minutes |
| `/api/register` | 3 requests | 60 minutes |
| `/api/send-otp` | 3 requests | 5 minutes |
| `/api/bikes/*` | 100 requests | 1 minute |
| `/api/bike-operation` | 20 requests | 1 minute |
| `/api/subscriptions/*` | 10 requests | 1 minute |

**Rate Limit Response:**
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

---

## 🧪 Testing Endpoints

### Health Check
```http
GET /api/heartbeat
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-10T12:00:00Z",
  "version": "1.0.0",
  "services": {
    "firebase": "connected",
    "razorpay": "connected"
  }
}
```

---

## 📝 SDK Examples

### JavaScript/TypeScript
```typescript
// Initialize client
const client = {
  baseURL: 'https://yourdomain.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
};

// Get bike details
async function getBike(bikeId: string, operator: string) {
  const response = await fetch(
    `${client.baseURL}/bikes?bikeId=${bikeId}&operator=${operator}`,
    { headers: client.headers }
  );
  return response.json();
}

// Unlock bike
async function unlockBike(bikeId: string, operator: string) {
  const response = await fetch(`${client.baseURL}/bike-operation`, {
    method: 'POST',
    headers: client.headers,
    body: JSON.stringify({
      bikeId,
      operator,
      operation: '1',
      status: 'busy',
      battery: '87',
      ridetime: '480'
    })
  });
  return response.json();
}
```

### Python
```python
import requests

BASE_URL = "https://yourdomain.com/api"
TOKEN = "your_auth_token"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

# Get bike details
def get_bike(bike_id, operator):
    params = {"bikeId": bike_id, "operator": operator}
    response = requests.get(f"{BASE_URL}/bikes", params=params, headers=headers)
    return response.json()

# Unlock bike
def unlock_bike(bike_id, operator):
    payload = {
        "bikeId": bike_id,
        "operator": operator,
        "operation": "1",
        "status": "busy",
        "battery": "87",
        "ridetime": "480"
    }
    response = requests.post(f"{BASE_URL}/bike-operation", json=payload, headers=headers)
    return response.json()
```

---

## 🔐 Authentication Example

### Get Auth Token (Client-side)
```typescript
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

async function login(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const token = await userCredential.user.getIdToken();
  
  // Use token in API requests
  return token;
}
```

---

**For more details, see the full [README.md](README.md) documentation.**
