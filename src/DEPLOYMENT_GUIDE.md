# Wassel Deployment Guide

Complete production deployment guide for Wassel ride-sharing platform.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Third-Party Services](#third-party-services)
5. [Application Deployment](#application-deployment)
6. [Mobile Apps](#mobile-apps)
7. [Post-Deployment](#post-deployment)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 1. Prerequisites

### Required Accounts
- ✅ Supabase account (database & auth)
- ✅ Google Cloud Platform (Maps API)
- ✅ Stripe account (payments)
- ✅ Twilio account (SMS/Voice)
- ✅ SendGrid account (Email)
- ✅ Firebase project (Push notifications)

### Optional Accounts
- Jumio (Identity verification)
- Mixpanel (Analytics)
- Sentry (Error tracking)
- Checkr (Background checks)

### Development Tools
```bash
Node.js >= 18.0.0
npm >= 9.0.0 or yarn >= 1.22.0
Git
```

---

## 2. Environment Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/wassel.git
cd wassel
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and fill in all required values (see `.env.example` for details).

**Critical Variables:**
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_GOOGLE_MAPS_API_KEY`
- `REACT_APP_STRIPE_PUBLISHABLE_KEY`

---

## 3. Database Setup

### Step 1: Create Supabase Project
1. Go to https://app.supabase.com
2. Create new project
3. Note the project URL and anon key
4. Copy to `.env` file

### Step 2: Run Database Schema
```bash
# Connect to Supabase SQL Editor
# Or use Supabase CLI:

supabase db push

# Manually run if needed:
psql $DATABASE_URL < database/complete_schema.sql
```

### Step 3: Enable Required Extensions
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geo queries
CREATE EXTENSION IF NOT EXISTS "pg_cron"; -- For scheduled tasks
```

### Step 4: Set Up Storage Buckets
```bash
# In Supabase Dashboard > Storage, create buckets:
- profile-photos (public)
- vehicle-photos (public)
- dispute-evidence (private)
- insurance-documents (private)
```

### Step 5: Configure RLS Policies
All RLS policies are in `complete_schema.sql`. Verify they're active:
```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

---

## 4. Third-Party Services

### Google Maps API

1. **Create Project**
   - Go to Google Cloud Console
   - Create new project "Wassel"

2. **Enable APIs**
   ```
   - Maps JavaScript API
   - Directions API
   - Distance Matrix API
   - Geocoding API
   - Places API
   ```

3. **Create API Key**
   - API & Services > Credentials
   - Create credentials > API key
   - Restrict key to your domains
   - Copy to `REACT_APP_GOOGLE_MAPS_API_KEY`

4. **Set Usage Limits**
   - Set daily quota limits
   - Enable billing alerts

### Stripe Payments

1. **Create Account**
   - Go to https://stripe.com
   - Complete business verification

2. **Get API Keys**
   - Dashboard > Developers > API keys
   - Copy publishable key to `REACT_APP_STRIPE_PUBLISHABLE_KEY`
   - Copy secret key to `STRIPE_SECRET_KEY` (server-side)

3. **Configure Webhooks**
   ```
   Endpoint URL: https://your-api.com/webhooks/stripe
   Events to listen:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - charge.refunded
   ```

4. **Set Up Products**
   - Create product for ride fares
   - Configure tax settings
   - Set up payout schedule

### Twilio (SMS/Voice)

1. **Create Account**
   - Go to https://twilio.com
   - Complete verification

2. **Get Credentials**
   - Console > Account > Keys & Credentials
   - Copy Account SID to `REACT_APP_TWILIO_ACCOUNT_SID`
   - Copy Auth Token to `TWILIO_AUTH_TOKEN`

3. **Buy Phone Number**
   - Phone Numbers > Buy a number
   - Enable SMS and Voice capabilities
   - Copy to `TWILIO_PHONE_NUMBER`

4. **Configure Services**
   - Set up Verify service for OTP
   - Configure Voice settings
   - Set up TwiML for call routing

### SendGrid (Email)

1. **Create Account**
   - Go to https://sendgrid.com
   - Verify sender identity

2. **Create API Key**
   - Settings > API Keys
   - Create key with full access
   - Copy to `SENDGRID_API_KEY`

3. **Verify Domain**
   - Settings > Sender Authentication
   - Authenticate domain
   - Add DNS records

4. **Create Templates**
   ```
   - Welcome email
   - Trip receipt
   - Password reset
   - Verification email
   - Promotional emails
   ```

### Firebase (Push Notifications)

1. **Create Project**
   - Go to https://console.firebase.google.com
   - Create new project "Wassel"

2. **Add Web App**
   - Project Settings > Add app > Web
   - Copy config values to `.env`

3. **Enable Cloud Messaging**
   - Build > Cloud Messaging
   - Generate new key pair
   - Copy to service account

4. **Configure FCM**
   ```javascript
   // In src/firebase.ts
   import { initializeApp } from 'firebase/app';
   import { getMessaging } from 'firebase/messaging';
   
   const firebaseConfig = {
     apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
     projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
     messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.REACT_APP_FIREBASE_APP_ID
   };
   
   const app = initializeApp(firebaseConfig);
   export const messaging = getMessaging(app);
   ```

### Jumio (Identity Verification) - Optional

1. **Create Account**
   - Contact Jumio sales
   - Complete onboarding

2. **Get Credentials**
   - Dashboard > API credentials
   - Copy to `JUMIO_API_KEY` and `JUMIO_API_SECRET`

3. **Configure Workflow**
   - Set up ID verification workflow
   - Configure document types
   - Set up webhooks

---

## 5. Application Deployment

### Option A: Vercel (Recommended for Frontend)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure Environment**
   - Dashboard > Project Settings > Environment Variables
   - Add all `REACT_APP_*` variables

4. **Set Up Domain**
   - Add custom domain
   - Configure DNS

### Option B: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**
   ```bash
   netlify deploy --prod
   ```

3. **Configure**
   - Site settings > Build & deploy
   - Add environment variables

### Option C: AWS Amplify

1. **Connect Repository**
   - AWS Amplify Console
   - Connect GitHub/GitLab

2. **Configure Build**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: build
       files:
         - '**/*'
   ```

3. **Add Environment Variables**
   - App settings > Environment variables

### Backend API Deployment (Supabase Edge Functions)

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login**
   ```bash
   supabase login
   ```

3. **Deploy Functions**
   ```bash
   supabase functions deploy
   ```

4. **Set Secrets**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_...
   supabase secrets set TWILIO_AUTH_TOKEN=...
   supabase secrets set SENDGRID_API_KEY=...
   ```

---

## 6. Mobile Apps

### iOS App (React Native or Native)

1. **Prerequisites**
   - Xcode 14+
   - Apple Developer account ($99/year)
   - Mac computer

2. **Setup**
   ```bash
   cd mobile/ios
   pod install
   ```

3. **Configure**
   - Update bundle identifier in Xcode
   - Configure signing certificates
   - Add required capabilities (Location, Push Notifications)

4. **Build**
   ```bash
   xcodebuild archive -workspace Wassel.xcworkspace -scheme Wassel
   ```

5. **Submit to App Store**
   - Archive > Distribute App
   - Upload to App Store Connect
   - Submit for review

### Android App

1. **Prerequisites**
   - Android Studio
   - Google Play Developer account ($25 one-time)

2. **Setup**
   ```bash
   cd mobile/android
   ./gradlew build
   ```

3. **Configure**
   - Update applicationId in build.gradle
   - Create signing key
   - Configure permissions in AndroidManifest.xml

4. **Build Release**
   ```bash
   ./gradlew assembleRelease
   ```

5. **Submit to Play Store**
   - Google Play Console
   - Create app
   - Upload APK/AAB
   - Submit for review

---

## 7. Post-Deployment

### 1. Verify All Integrations
```bash
# Test checklist:
✓ User registration works
✓ Google Maps loads correctly
✓ Trip booking flow completes
✓ Payments process successfully
✓ SMS verification works
✓ Email notifications send
✓ Push notifications arrive
✓ Real-time location updates
✓ Rating system works
✓ Disputes can be filed
```

### 2. Set Up Monitoring

**Sentry Error Tracking**
```bash
npm install @sentry/react
```

```javascript
// src/index.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENV,
  tracesSampleRate: 1.0,
});
```

**Mixpanel Analytics**
```javascript
// Track key events
mixpanel.track('Trip Booked', {
  fare: 45.00,
  distance: 12.5,
  vehicle_type: 'standard'
});
```

### 3. Configure Backups

**Database Backups (Supabase)**
- Supabase Pro: Daily automated backups
- Download manual backup weekly

**Storage Backups**
```bash
# Script to backup Supabase storage
supabase storage download --all
```

### 4. Set Up SSL/HTTPS
- Vercel/Netlify: Automatic
- Custom domain: Configure in hosting provider

### 5. Configure CDN
- Enable Cloudflare (recommended)
- Configure caching rules
- Set up DDoS protection

### 6. Security Hardening

**Rate Limiting**
```javascript
// Implement in API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

**Content Security Policy**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline' https://maps.googleapis.com">
```

---

## 8. Monitoring & Maintenance

### Daily Checks
- [ ] Monitor error rates (Sentry)
- [ ] Check payment success rate
- [ ] Review fraud alerts
- [ ] Monitor active trips

### Weekly Tasks
- [ ] Review user feedback
- [ ] Analyze key metrics
- [ ] Update exchange rates
- [ ] Check storage usage
- [ ] Review dispute queue

### Monthly Tasks
- [ ] Security audit
- [ ] Performance optimization
- [ ] Database cleanup
- [ ] Backup verification
- [ ] Cost analysis

### Quarterly Tasks
- [ ] Dependency updates
- [ ] Compliance review
- [ ] Feature roadmap review
- [ ] Disaster recovery test

---

## 🚨 Troubleshooting

### Common Issues

**1. Maps not loading**
- Verify API key is correct
- Check API is enabled in Google Cloud
- Verify domain restrictions

**2. Payments failing**
- Check Stripe test/live mode
- Verify webhook endpoint
- Check API version compatibility

**3. SMS not sending**
- Verify Twilio credits
- Check phone number format
- Verify sender number

**4. Real-time not working**
- Check Supabase Realtime enabled
- Verify RLS policies
- Check WebSocket connection

---

## 📞 Support

- Documentation: https://docs.wassel.com
- Email: support@wassel.com
- Emergency: +971 4 XXX XXXX

---

## ✅ Launch Checklist

Before going live:

- [ ] All environment variables set
- [ ] Database schema deployed
- [ ] All integrations tested
- [ ] SSL certificates active
- [ ] Monitoring configured
- [ ] Backup system active
- [ ] Legal documents published
- [ ] Privacy policy accessible
- [ ] Terms of service published
- [ ] Support system ready
- [ ] Payment processing tested
- [ ] Mobile apps approved
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Compliance verified
- [ ] Team trained
- [ ] Marketing materials ready
- [ ] PR/launch plan ready

---

**Deployment Complete! 🎉**

Your Wassel platform is now live and ready to connect passengers with drivers!
