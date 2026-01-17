# Wassel - Features Quick Reference Guide

A quick reference for all 35+ features in Wassel (واصل).

---

## 🚀 CORE USER FEATURES

| # | Feature | Component/Hook | Backend Endpoint | Status |
|---|---------|----------------|------------------|--------|
| 1 | User Signup/Login | `/contexts/AuthContext.tsx` | `POST /auth/signup` | ✅ |
| 2 | User Profile | `/components/UserProfile.tsx` | `GET/PUT /profile/:userId` | ✅ |
| 3 | Create Trip | `/components/OfferRide.tsx` | `POST /trips` | ✅ |
| 4 | Search Trips | `/components/FindRide.tsx` | `GET /trips/search` | ✅ |
| 5 | Book Trip | Uses `useRealBookings` | `POST /bookings` | ✅ |
| 6 | Live Map Tracking | `/components/LiveTripMap.tsx` | N/A (GPS) | ✅ |
| 7 | Messaging | `/components/Messages.tsx` | `POST /messages` | ✅ |
| 8 | Notifications | `/components/NotificationCenter.tsx` | `GET /notifications/:userId` | ✅ |
| 9 | Rate & Review | `/components/RatingDialog.tsx` | `POST /reviews` | ✅ |
| 10 | Wallet & Payments | `/components/Payments.tsx` | `GET/POST /wallet/:userId` | ✅ |

---

## 💎 PREMIUM FEATURES

| # | Feature | Component | Backend Endpoint | Status |
|---|---------|-----------|------------------|--------|
| 11 | Recurring Trips | `/components/RecurringTrips.tsx` | `POST /recurring-trips` | ✅ |
| 12 | Trip Analytics | `/components/TripAnalytics.tsx` | `GET /analytics/:userId` | ✅ |
| 13 | Safety Center | `/components/SafetyCenter.tsx` | `POST /emergency-contacts` | ✅ |
| 14 | Advanced Filters | `/components/AdvancedFilters.tsx` | N/A (Client-side) | ✅ |
| 15 | Favorites | `/components/Favorites.tsx` | N/A (Local storage) | ✅ |
| 16 | Referral Program | `/components/ReferralProgram.tsx` | `GET/POST /referral` | ✅ |
| 17 | Promo Codes | `/components/PromoCodesManager.tsx` | N/A (Mock) | ✅ |
| 18 | Split Payment | `/components/SplitPayment.tsx` | N/A (Mock) | ✅ |
| 19 | Business Accounts | `/components/BusinessAccounts.tsx` | N/A (Mock) | ✅ |
| 20 | Verification | `/components/VerificationCenter.tsx` | N/A (Mock) | ✅ |

---

## 🔧 BACKEND ENDPOINTS REFERENCE

### Authentication
```
POST /make-server-0b1f4071/auth/signup
Body: { email, password, fullName }
```

### Profiles
```
GET  /make-server-0b1f4071/profile/:userId
PUT  /make-server-0b1f4071/profile/:userId
```

### Trips
```
POST /make-server-0b1f4071/trips
GET  /make-server-0b1f4071/trips/search?from=X&to=Y&date=Z
GET  /make-server-0b1f4071/trips/:tripId
PUT  /make-server-0b1f4071/trips/:tripId
```

### Bookings
```
POST /make-server-0b1f4071/bookings
PUT  /make-server-0b1f4071/bookings/:bookingId
GET  /make-server-0b1f4071/bookings/user/:userId
```

### Messages
```
POST /make-server-0b1f4071/messages
GET  /make-server-0b1f4071/messages/conversation/:userId1/:userId2
```

### Notifications
```
GET /make-server-0b1f4071/notifications/:userId
PUT /make-server-0b1f4071/notifications/:notificationId/read
```

### Reviews
```
POST /make-server-0b1f4071/reviews
GET  /make-server-0b1f4071/reviews/:userId
```

### Recurring Trips
```
POST /make-server-0b1f4071/recurring-trips
GET  /make-server-0b1f4071/recurring-trips/:userId
```

### Wallet
```
GET  /make-server-0b1f4071/wallet/:userId
POST /make-server-0b1f4071/wallet/:userId/add-funds
```

### Emergency
```
GET  /make-server-0b1f4071/emergency-contacts/:userId
POST /make-server-0b1f4071/emergency-contacts/:userId
```

### Analytics
```
GET /make-server-0b1f4071/analytics/:userId
```

### Referrals
```
GET  /make-server-0b1f4071/referral/:userId
POST /make-server-0b1f4071/referral/apply
Body: { referral_code }
```

---

## 📱 COMPONENT NAVIGATION

### Access from Sidebar:

**Main Menu:**
- Dashboard → `dashboard`
- Find a Ride → `find-ride`
- Offer a Ride → `offer-ride`
- My Trips → `my-trips`
- Recurring Trips → `recurring`
- Messages → `messages`
- **Favorites** → `favorites` ⭐ NEW

**Account Menu:**
- My Profile → `profile`
- Analytics → `analytics`
- Payments → `payments`
- Notifications → `notifications`
- Verification → `verification`
- Safety Center → `safety`
- **Referrals** → `referrals` ⭐ NEW
- **Promo Codes** → `promo-codes` ⭐ NEW
- **Business** → `business` ⭐ NEW
- Settings → `settings`

---

## 🎯 CUSTOM HOOKS USAGE

### 1. useRealTrips
```typescript
import { useRealTrips } from '../hooks/useRealTrips';

const { trips, loading, error, createTrip, searchTrips, getTrip, updateTrip } = useRealTrips();

// Create trip
const result = await createTrip({
  from: 'Dubai Marina',
  to: 'Business Bay',
  departure_date: '2025-11-04',
  departure_time: '08:00',
  price_per_seat: 25,
  total_seats: 4,
  trip_type: 'wasel'
});

// Search trips
await searchTrips({ from: 'Dubai', to: 'Abu Dhabi', date: '2025-11-04', seats: 2 });
```

### 2. useRealBookings
```typescript
import { useRealBookings } from '../hooks/useRealBookings';

const { bookings, loading, error, createBooking, updateBookingStatus, getUserBookings } = useRealBookings();

// Create booking
await createBooking({
  trip_id: 'trip:123',
  seats_requested: 2,
  pickup_stop: 'Dubai Marina',
  dropoff_stop: 'Business Bay'
});

// Accept booking
await updateBookingStatus('booking:456', 'accepted');
```

### 3. useRealMessages
```typescript
import { useRealMessages } from '../hooks/useRealMessages';

const { messages, loading, error, sendMessage, getConversation } = useRealMessages();

// Send message
await sendMessage({
  recipient_id: 'user123',
  trip_id: 'trip456',
  content: 'Hello!'
});

// Get conversation
await getConversation('user1', 'user2');
```

### 4. useRealNotifications
```typescript
import { useRealNotifications } from '../hooks/useRealNotifications';

const { notifications, unreadCount, loading, error, getNotifications, markAsRead } = useRealNotifications();

// Notifications auto-fetch and poll every 30s
// Mark as read
await markAsRead('notification:123');
```

---

## 🎨 COLOR PALETTE

```css
/* Primary - Teal */
--color-primary: #008080;

/* Secondary - Olive Green */
--color-secondary: #607D4B;

/* Accent - Burgundy */
--color-accent: #880044;

/* Usage in Tailwind */
className="bg-primary text-primary-foreground"
className="bg-secondary text-secondary-foreground"
className="bg-accent text-accent-foreground"
```

---

## 🌍 BILINGUAL LABELS

All sidebar items have Arabic translations:

```typescript
{ 
  id: 'dashboard', 
  label: 'Dashboard', 
  labelAr: 'لوحة التحكم',
  icon: LayoutDashboard 
}
```

To display Arabic:
```typescript
<span>{item.labelAr}</span>
```

---

## 🔐 AUTHENTICATION

### Sign Up:
```typescript
import { useAuth } from './contexts/AuthContext';

const { signup } = useAuth();

await signup({
  email: 'user@example.com',
  password: 'password123',
  fullName: 'Ahmed Mohammed'
});
```

### Login:
```typescript
const { login } = useAuth();

await login({
  email: 'user@example.com',
  password: 'password123'
});
```

### Get Current User:
```typescript
const { user, session, loading } = useAuth();

if (user) {
  console.log(user.id, user.email);
}
```

### Logout:
```typescript
const { logout } = useAuth();
await logout();
```

---

## 📊 FEATURE STATUS BY CATEGORY

### ✅ Fully Integrated with Backend:
- Authentication
- Profiles
- Trips (create, search, update)
- Bookings (create, update, list)
- Messages
- Notifications
- Reviews
- Recurring Trips
- Wallet
- Emergency Contacts
- Analytics
- Referrals

### ⚙️ Frontend Only (Mock Data):
- Promo Codes Manager
- Split Payment
- Business Accounts
- Favorites (using local state)
- Verification Documents (upload ready)

### 📍 Real-time/GPS:
- Live Trip Map
- Location Sharing
- Map Component

---

## 🚦 DATA FLOW

### Trip Booking Flow:
```
1. User searches trips → useRealTrips.searchTrips()
2. Results displayed → FindRide component
3. User clicks "Book" → useRealBookings.createBooking()
4. Backend creates booking + notification
5. Driver receives notification → NotificationCenter
6. Driver accepts → updateBookingStatus('accepted')
7. Passenger gets notification
8. Trip starts → LiveTripMap shows tracking
9. Trip completes → RatingDialog appears
10. Reviews saved → Backend updates ratings
```

### Referral Flow:
```
1. User signs up
2. Backend auto-generates referral code
3. User shares code → ReferralProgram component
4. Friend signs up with code
5. Backend applies referral → Both get bonuses
6. Referrer sees updated count/earnings
```

---

## 💡 COMMON PATTERNS

### Loading State:
```typescript
if (loading) {
  return <div>Loading...</div>;
}
```

### Error Handling:
```typescript
if (error) {
  toast.error(error);
}
```

### Success Toast:
```typescript
import { toast } from 'sonner@2.0.3';
toast.success('Operation successful!');
```

### Navigation:
```typescript
// In any component
<Button onClick={() => onNavigate('profile')}>
  Go to Profile
</Button>
```

---

## 🎯 KEY METRICS TO TRACK

### User Metrics:
- Total users signed up
- Active users (last 30 days)
- Verification completion rate
- Average trips per user

### Trip Metrics:
- Total trips created
- Total bookings
- Booking acceptance rate
- Average price per trip
- Popular routes

### Financial Metrics:
- Total transaction volume
- Average wallet balance
- Referral bonus paid
- Commission earned

### Engagement Metrics:
- Messages sent
- Reviews submitted
- Favorite routes saved
- Referrals made

---

## 🔧 TROUBLESHOOTING

### Backend not responding:
1. Check Supabase URL and keys in `.env`
2. Verify server is running
3. Check browser console for errors
4. Check network tab for failed requests

### Authentication failing:
1. Verify SUPABASE_ANON_KEY is set
2. Check email format
3. Ensure backend `/auth/signup` is working
4. Check AuthContext provider wraps app

### Real-time not updating:
1. Check polling interval (30s default)
2. Verify notification endpoint working
3. Check useEffect dependencies
4. Force refresh with getNotifications()

---

## 📞 API TESTING

### Using cURL:

**Create Account:**
```bash
curl -X POST https://YOUR-PROJECT.supabase.co/functions/v1/make-server-0b1f4071/auth/signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -d '{"email":"test@test.com","password":"test123","fullName":"Test User"}'
```

**Search Trips:**
```bash
curl -X GET "https://YOUR-PROJECT.supabase.co/functions/v1/make-server-0b1f4071/trips/search?from=Dubai&to=Abu%20Dhabi" \
  -H "Authorization: Bearer YOUR-ANON-KEY"
```

---

## 🎉 QUICK WINS

### To Test Everything:
1. ✅ Sign up a new account
2. ✅ Complete profile
3. ✅ Create a trip
4. ✅ Search for trips
5. ✅ Book a trip
6. ✅ Check notifications
7. ✅ Send a message
8. ✅ Add to favorites
9. ✅ Get referral code
10. ✅ View analytics

---

## 📝 NOTES

- All API calls use Bearer token authentication
- Backend uses KV store for data persistence
- Real-time updates via polling (30s intervals)
- Maps use Leaflet with OpenStreetMap
- Icons from Lucide React
- UI components from Shadcn/ui

---

**Last Updated:** November 3, 2025  
**Version:** 1.0 - Production Ready
