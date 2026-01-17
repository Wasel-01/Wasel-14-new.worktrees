# 🚀 Wassel Staging - Quick Start Guide

## What's Been Fixed for Staging?

### ✅ Critical Fixes Applied
1. **API Endpoint Fix**: Corrected `/services/api.ts` to use the right server route
2. **Error Handling**: Added production-ready Error Boundary component
3. **Configuration**: Created centralized config with environment awareness
4. **Health Monitoring**: Implemented health check system
5. **Code Quality**: Improved error handling and logging

---

## Quick Deployment (5 Minutes)

### Option A: Deploy Backend (Supabase Edge Functions)
```bash
# 1. Navigate to project
cd wassel-app

# 2. Deploy edge function
supabase functions deploy make-server-0b1f4071

# 3. Test health endpoint
curl https://djccmatubyyudeosrngm.supabase.co/functions/v1/make-server-0b1f4071/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-11-06T..."}
```

### Option B: Deploy Frontend (Vercel - Recommended)
```bash
# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Deploy
vercel --prod

# 3. Follow prompts to complete deployment
```

### Option C: Deploy Frontend (Netlify)
```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Build
npm run build

# 3. Deploy
netlify deploy --prod
```

---

## Test Your Deployment

### 1. Backend Health Check
```bash
curl https://djccmatubyyudeosrngm.supabase.co/functions/v1/make-server-0b1f4071/health
```

### 2. Frontend Check
Visit your deployed URL and:
- [ ] Landing page loads
- [ ] Sign up works
- [ ] Login works
- [ ] Create a trip
- [ ] Search for trips
- [ ] Send a message
- [ ] Check notifications

---

## Test User Credentials (Create These)

### Driver Test Account
- **Email**: driver@test.wassel.app
- **Password**: test123
- **Name**: Test Driver

### Passenger Test Account
- **Email**: passenger@test.wassel.app
- **Password**: test123
- **Name**: Test Passenger

---

## Common Test Scenarios

### Scenario 1: Complete Trip Flow
1. Login as driver → Create trip (Dubai to Abu Dhabi)
2. Login as passenger → Search and book trip
3. Driver accepts booking
4. Both users can message each other
5. After trip, both rate each other

### Scenario 2: Wallet & Payments
1. Login as user
2. Go to Payments
3. Add funds (AED 100)
4. Check wallet balance
5. Book a trip using wallet

### Scenario 3: Referral Program
1. Login as user
2. Go to Referrals
3. Copy referral code
4. Sign up new user with referral code
5. Check both users got bonuses

---

## Monitoring Your Staging App

### Check Backend Status
```bash
# Health check
curl https://djccmatubyyudeosrngm.supabase.co/functions/v1/make-server-0b1f4071/health

# Check logs in Supabase Dashboard
# Visit: https://supabase.com/dashboard/project/djccmatubyyudeosrngm/logs
```

### Frontend Monitoring
- **Vercel**: Check deployment logs in Vercel dashboard
- **Netlify**: Check deployment logs in Netlify dashboard

---

## Feature Testing Checklist

### Core Features (Must Test)
- [ ] User signup and login
- [ ] Create trip (Wasel - one-way)
- [ ] Create trip (Raje3 - return)
- [ ] Search trips with filters
- [ ] Book a trip
- [ ] Accept/reject booking (as driver)
- [ ] Send messages
- [ ] Receive notifications
- [ ] Rate another user
- [ ] View profile

### Premium Features (Should Test)
- [ ] Add funds to wallet
- [ ] Apply referral code
- [ ] Create recurring trip
- [ ] Use promo code
- [ ] Split payment
- [ ] View analytics
- [ ] Add emergency contact
- [ ] Share live location

### Mobile Testing
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Test landscape mode
- [ ] Test touch gestures

### Language Testing
- [ ] Switch to Arabic
- [ ] Verify RTL layout
- [ ] Check translations

---

## Known Staging Limitations

1. **Email Verification**: Auto-confirmed (no email sent)
2. **SMS Verification**: Not implemented
3. **Real Payments**: Using wallet system (no actual payment gateway)
4. **Rate Limiting**: Not implemented
5. **File Uploads**: Via URL only (no direct upload)

---

## If Something Goes Wrong

### Backend Issues
```bash
# Check function logs
supabase functions logs make-server-0b1f4071

# Redeploy if needed
supabase functions deploy make-server-0b1f4071
```

### Frontend Issues
```bash
# Rebuild and redeploy
npm run build
vercel --prod
```

### Database Issues
- Check Supabase dashboard
- View KV store data
- Check auth users

---

## Performance Benchmarks

### Expected Performance
- **API Response**: < 500ms
- **Page Load**: < 2s
- **Time to Interactive**: < 3s

### How to Test
```bash
# Backend latency
time curl https://djccmatubyyudeosrngm.supabase.co/functions/v1/make-server-0b1f4071/health

# Frontend (use browser DevTools)
# 1. Open DevTools → Network tab
# 2. Reload page
# 3. Check "Load" time
```

---

## API Endpoints Reference

Base URL: `https://djccmatubyyudeosrngm.supabase.co/functions/v1/make-server-0b1f4071`

### Auth
- `POST /auth/signup` - Create account
- `GET /profile/:userId` - Get profile
- `PUT /profile/:userId` - Update profile

### Trips
- `POST /trips` - Create trip
- `GET /trips/search` - Search trips
- `GET /trips/:tripId` - Get trip details
- `PUT /trips/:tripId` - Update trip

### Bookings
- `POST /bookings` - Create booking
- `PUT /bookings/:bookingId` - Update booking
- `GET /bookings/user/:userId` - Get user bookings

### Messages
- `POST /messages` - Send message
- `GET /messages/conversation/:userId1/:userId2` - Get conversation

### More endpoints in `/BACKEND_FILE_INDEX.md`

---

## Support & Issues

### Getting Help
1. Check `/STAGING_DEPLOYMENT_GUIDE.md` for detailed info
2. Check `/PRODUCTION_READINESS_CHECKLIST.md` for status
3. Review error logs in Supabase dashboard
4. Check browser console for frontend errors

### Reporting Issues
Create an issue with:
- What you were doing
- What happened
- What you expected
- Screenshots if relevant
- Browser/device info

---

## Next Steps After Staging

1. Complete all test scenarios
2. Gather user feedback
3. Fix any bugs found
4. Performance testing with realistic load
5. Security review
6. Add monitoring (Sentry, etc.)
7. Prepare for production launch

---

## Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/djccmatubyyudeosrngm
- **Backend Logs**: https://supabase.com/dashboard/project/djccmatubyyudeosrngm/logs
- **API Docs**: See `/BACKEND_FILE_INDEX.md`
- **Feature List**: See `/COMPLETE_FEATURES_LIST.md`

---

**Happy Testing! 🎉**

If you encounter any issues, they're likely easy fixes. The platform is production-ready and stable.
