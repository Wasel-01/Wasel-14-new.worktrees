# Wassel API Reference

Complete API documentation for backend integration.

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Trip Management](#trip-management)
3. [Payment Processing](#payment-processing)
4. [User Management](#user-management)
5. [Communication](#communication)
6. [Admin Operations](#admin-operations)
7. [Real-Time Events](#real-time-events)
8. [Error Handling](#error-handling)

---

## Authentication

All API requests require authentication using Supabase JWT tokens.

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Get Current User
```http
GET /auth/user
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "passenger|driver|admin",
  "profile": {
    "full_name": "John Doe",
    "phone": "+971501234567",
    "rating": 4.8
  }
}
```

---

## Trip Management

### Create Trip
```http
POST /api/trips
```

**Request Body:**
```json
{
  "from_location": "Dubai Marina",
  "to_location": "Dubai Mall",
  "from_coordinates": {"lat": 25.0772, "lng": 55.1309},
  "to_coordinates": {"lat": 25.1972, "lng": 55.2744},
  "vehicle_type": "standard",
  "scheduled_time": "2026-01-05T09:00:00Z", // optional
  "payment_method_id": "pm_123",
  "notes": "Please call on arrival"
}
```

**Response:**
```json
{
  "trip_id": "uuid",
  "status": "waiting",
  "estimated_fare": 45.50,
  "estimated_duration": 1200,
  "estimated_distance": 12500,
  "created_at": "2026-01-02T10:30:00Z"
}
```

### Get Trip Details
```http
GET /api/trips/:tripId
```

**Response:**
```json
{
  "id": "uuid",
  "status": "in_progress",
  "passenger": {
    "id": "uuid",
    "name": "John Doe",
    "rating": 4.8
  },
  "driver": {
    "id": "uuid",
    "name": "Ahmed Ali",
    "rating": 4.9,
    "vehicle": {
      "model": "Toyota Camry",
      "plate": "A-12345",
      "color": "Silver"
    },
    "location": {"lat": 25.1234, "lng": 55.4321}
  },
  "from_location": "Dubai Marina",
  "to_location": "Dubai Mall",
  "fare": 45.50,
  "eta": "2026-01-02T11:00:00Z"
}
```

### Cancel Trip
```http
POST /api/trips/:tripId/cancel
```

**Request Body:**
```json
{
  "reason": "changed_plans",
  "notes": "No longer needed"
}
```

**Response:**
```json
{
  "success": true,
  "refund_amount": 45.50,
  "cancellation_fee": 0,
  "refund_status": "processed"
}
```

### Rate Trip
```http
POST /api/trips/:tripId/rate
```

**Request Body:**
```json
{
  "overall": 5,
  "punctuality": 5,
  "cleanliness": 4,
  "communication": 5,
  "driving": 5,
  "comment": "Great driver!",
  "badges": ["helpful", "professional"]
}
```

---

## Payment Processing

### Create Payment Intent
```http
POST /api/payments/create-intent
```

**Request Body:**
```json
{
  "amount": 4550, // in cents
  "currency": "aed",
  "trip_id": "uuid",
  "metadata": {
    "trip_type": "standard",
    "distance": 12.5
  }
}
```

**Response:**
```json
{
  "payment_intent_id": "pi_123",
  "client_secret": "pi_123_secret_abc",
  "amount": 4550,
  "currency": "aed",
  "status": "requires_payment_method"
}
```

### Confirm Payment
```http
POST /api/payments/confirm
```

**Request Body:**
```json
{
  "payment_intent_id": "pi_123",
  "payment_method_id": "pm_card_123"
}
```

**Response:**
```json
{
  "success": true,
  "payment_intent_id": "pi_123",
  "status": "succeeded",
  "amount_received": 4550
}
```

### Process Refund
```http
POST /api/payments/refund
```

**Request Body:**
```json
{
  "payment_intent_id": "pi_123",
  "amount": 4550, // optional, defaults to full refund
  "reason": "requested_by_customer"
}
```

**Response:**
```json
{
  "success": true,
  "refund_id": "re_123",
  "amount": 4550,
  "status": "succeeded"
}
```

### Add Payment Method
```http
POST /api/payments/methods
```

**Request Body:**
```json
{
  "payment_method_id": "pm_card_123",
  "set_as_default": true
}
```

---

## User Management

### Update Profile
```http
PUT /api/users/profile
```

**Request Body:**
```json
{
  "full_name": "John Doe",
  "phone": "+971501234567",
  "email": "john@example.com",
  "avatar_url": "https://...",
  "preferences": {
    "language": "en",
    "currency": "AED",
    "notifications": true
  }
}
```

### Identity Verification
```http
POST /api/verification/initiate
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "country": "AE",
  "document_type": "PASSPORT"
}
```

**Response:**
```json
{
  "verification_id": "jm_123",
  "redirect_url": "https://verification.jumio.com/...",
  "expires_at": "2026-01-02T12:00:00Z"
}
```

### Check Verification Status
```http
GET /api/verification/status/:verificationId
```

**Response:**
```json
{
  "status": "approved",
  "verified_at": "2026-01-02T11:30:00Z",
  "document": {
    "type": "PASSPORT",
    "number": "A1234567",
    "expiry": "2030-01-01"
  }
}
```

---

## Communication

### Send SMS
```http
POST /api/sms/send
```

**Request Body:**
```json
{
  "to": "+971501234567",
  "message": "Your verification code is 1234"
}
```

### Send Email
```http
POST /api/email/send
```

**Request Body:**
```json
{
  "to": "user@example.com",
  "template": "trip_receipt",
  "data": {
    "trip_id": "uuid",
    "fare": 45.50,
    "from": "Dubai Marina",
    "to": "Dubai Mall"
  }
}
```

### Send Push Notification
```http
POST /api/notifications/push
```

**Request Body:**
```json
{
  "user_id": "uuid",
  "title": "Driver Arriving",
  "body": "Your driver is 2 minutes away",
  "data": {
    "trip_id": "uuid",
    "action": "open_trip"
  }
}
```

### Initiate Call
```http
POST /api/voice/call
```

**Request Body:**
```json
{
  "from": "passenger_id",
  "to": "driver_id",
  "trip_id": "uuid"
}
```

**Response:**
```json
{
  "call_sid": "CA123",
  "status": "initiated",
  "masked_number": "+971501234567"
}
```

---

## Admin Operations

### Get Platform Statistics
```http
GET /api/admin/stats
```

**Response:**
```json
{
  "users": {
    "total": 10000,
    "active": 8500,
    "drivers": 500,
    "passengers": 9500
  },
  "trips": {
    "total": 50000,
    "active": 125,
    "completed_today": 450
  },
  "revenue": {
    "today": 15420.50,
    "month": 345890.25
  }
}
```

### Suspend User
```http
POST /api/admin/users/:userId/suspend
```

**Request Body:**
```json
{
  "reason": "Violation of terms",
  "duration": "7d", // or "permanent"
  "notify_user": true
}
```

### Resolve Dispute
```http
POST /api/admin/disputes/:disputeId/resolve
```

**Request Body:**
```json
{
  "resolution": "approved",
  "refund_amount": 45.50,
  "message": "Refund processed as requested",
  "admin_notes": "Verified evidence"
}
```

### Process Payout
```http
POST /api/admin/payouts/process
```

**Request Body:**
```json
{
  "driver_id": "uuid",
  "amount": 500.00,
  "method": "bank_transfer"
}
```

---

## Real-Time Events

Subscribe to real-time events using Supabase Realtime:

### Trip Updates
```javascript
const channel = supabase
  .channel(`trip:${tripId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'trips',
    filter: `id=eq.${tripId}`
  }, (payload) => {
    console.log('Trip updated:', payload.new);
  })
  .subscribe();
```

### Driver Location
```javascript
const channel = supabase
  .channel(`location:${tripId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'live_locations',
    filter: `trip_id=eq.${tripId}`
  }, (payload) => {
    console.log('Location updated:', payload.new.coordinates);
  })
  .subscribe();
```

### New Messages
```javascript
const channel = supabase
  .channel(`messages:${userId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `receiver_id=eq.${userId}`
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

---

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "PAYMENT_FAILED",
    "message": "Payment processing failed",
    "details": {
      "reason": "insufficient_funds",
      "card_last4": "4242"
    }
  }
}
```

### Error Codes

#### Authentication Errors (401)
- `AUTH_REQUIRED` - Authentication required
- `INVALID_TOKEN` - Invalid or expired token
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions

#### Validation Errors (400)
- `INVALID_INPUT` - Invalid request data
- `MISSING_FIELD` - Required field missing
- `INVALID_FORMAT` - Data format incorrect

#### Business Logic Errors (422)
- `TRIP_NOT_AVAILABLE` - No drivers available
- `INSUFFICIENT_BALANCE` - Wallet balance too low
- `DRIVER_BUSY` - Driver already on trip
- `TRIP_ALREADY_RATED` - Trip already rated

#### Payment Errors (402)
- `PAYMENT_FAILED` - Payment processing failed
- `CARD_DECLINED` - Card was declined
- `INSUFFICIENT_FUNDS` - Insufficient funds

#### Server Errors (500)
- `INTERNAL_ERROR` - Internal server error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable

---

## Rate Limiting

- **Standard**: 100 requests per 15 minutes
- **Authentication**: 5 requests per minute
- **Payment**: 10 requests per minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704194400
```

---

## Webhooks

### Stripe Webhooks
```http
POST /webhooks/stripe
```

**Events:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`
- `customer.subscription.updated`

### Twilio Webhooks
```http
POST /webhooks/twilio
```

**Events:**
- `message.received`
- `call.completed`
- `call.failed`

---

## Testing

### Test Credentials

**Test Cards (Stripe):**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

**Test Phone (Twilio):**
- `+15005550006` - Valid, receives SMS
- `+15005550001` - Invalid number

**Test Email (SendGrid):**
- Use any email in test mode
- Check SendGrid dashboard for delivery

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Create trip
const { data, error } = await supabase
  .from('trips')
  .insert({
    passenger_id: userId,
    from_location: 'Dubai Marina',
    to_location: 'Dubai Mall',
    vehicle_type: 'standard'
  })
  .select()
  .single();
```

### cURL
```bash
curl -X POST https://api.wassel.com/api/trips \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from_location": "Dubai Marina",
    "to_location": "Dubai Mall",
    "vehicle_type": "standard"
  }'
```

---

## Versioning

Current API Version: **v1**

```http
Accept: application/vnd.wassel.v1+json
```

---

## Support

- **API Documentation**: https://api.wassel.com/docs
- **Status Page**: https://status.wassel.com
- **Developer Support**: api@wassel.com
- **Emergency**: +971 4 XXX XXXX

---

*Last Updated: January 2, 2026*
*API Version: 1.0.0*
