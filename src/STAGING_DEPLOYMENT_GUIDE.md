# Wassel - Staging/Pre-Production Deployment Guide

## 🚀 Overview
This guide will help you deploy Wassel to a staging environment for pre-production testing.

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Verify Supabase project is set up correctly
- [ ] Confirm environment variables are configured:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_DB_URL`
- [ ] Check `/utils/supabase/info.tsx` has correct project ID

### 2. Backend Verification
- [ ] Test all 22+ API endpoints are working
- [ ] Verify authentication flow (signup/login/logout)
- [ ] Test trip creation and search
- [ ] Verify booking system
- [ ] Test messaging system
- [ ] Check notifications are being created
- [ ] Test wallet operations
- [ ] Verify referral system

### 3. Security Audit
- [x] All API endpoints have proper authentication
- [x] Authorization checks in place (users can only access their own data)
- [x] Passwords are handled securely
- [x] Service role key is never exposed to frontend
- [x] CORS is configured properly
- [ ] Rate limiting implemented (recommended for production)
- [ ] Input validation on all endpoints

### 4. Performance Optimization
- [ ] Test with realistic data volumes
- [ ] Monitor API response times
- [ ] Check for memory leaks
- [ ] Optimize database queries (if needed)
- [ ] Enable CDN for static assets (recommended)

### 5. Testing Requirements
- [ ] Test all user flows end-to-end
- [ ] Test on mobile devices (iOS/Android)
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Test Arabic language support
- [ ] Test RTL layout for Arabic
- [ ] Verify map functionality
- [ ] Test payment flows
- [ ] Verify email/phone verification (if enabled)

### 6. Monitoring & Logging
- [x] Console logging implemented
- [x] Error boundary in place
- [ ] Set up error tracking (Sentry recommended)
- [ ] Configure performance monitoring
- [ ] Set up uptime monitoring
- [ ] Create health check endpoint alerts

## 🔧 Deployment Steps

### Step 1: Supabase Edge Functions Deployment
```bash
# Deploy the server function
cd supabase/functions
supabase functions deploy make-server-0b1f4071

# Verify deployment
curl https://[your-project-id].supabase.co/functions/v1/make-server-0b1f4071/health
```

### Step 2: Frontend Build & Deploy
```bash
# Build the application
npm run build

# Deploy to your hosting provider (Vercel, Netlify, etc.)
# Example for Vercel:
vercel deploy --prod

# Example for Netlify:
netlify deploy --prod
```

### Step 3: Post-Deployment Verification
1. **Health Check**: Visit the health endpoint
2. **Auth Test**: Create a test account and sign in
3. **Trip Test**: Create and search for trips
4. **Booking Test**: Book a trip
5. **Messages Test**: Send messages between users
6. **Wallet Test**: Add funds and check balance

## 🔐 Security Hardening for Production

### Recommended Additional Security Measures:
1. **Rate Limiting**: Add rate limiting to prevent abuse
   ```typescript
   // Add to server/index.tsx
   import { rateLimiter } from 'hono/rate-limiter'
   
   app.use(rateLimiter({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   }))
   ```

2. **Input Validation**: Add Zod validation to all endpoints
   ```typescript
   import { z } from 'zod'
   
   const tripSchema = z.object({
     from: z.string().min(1),
     to: z.string().min(1),
     price_per_seat: z.number().positive(),
     // ... more validations
   })
   ```

3. **HTTPS Only**: Ensure all connections use HTTPS in production

4. **Content Security Policy**: Add CSP headers
   ```typescript
   app.use('/*', secureHeaders())
   ```

## 📊 Monitoring Endpoints

### Health Check
```bash
GET https://[project-id].supabase.co/functions/v1/make-server-0b1f4071/health
```

### Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🐛 Common Issues & Solutions

### Issue: 401 Unauthorized Errors
**Solution**: Check that access tokens are being properly passed in Authorization headers

### Issue: CORS Errors
**Solution**: Verify CORS configuration in server/index.tsx allows your frontend domain

### Issue: Slow API Responses
**Solution**: Check KV store performance, consider adding caching layer

### Issue: Session Expiry
**Solution**: Implement token refresh logic in AuthContext

## 🔄 Rollback Plan

If issues are discovered in staging:

1. **Keep Previous Version**: Always maintain the previous stable version
2. **Quick Rollback**: 
   ```bash
   # For Edge Functions
   supabase functions deploy make-server-0b1f4071 --version [previous-version]
   
   # For Frontend
   vercel rollback
   ```

3. **Database Migrations**: Have rollback scripts ready for any schema changes

## 📝 Staging Environment Variables

Create a `.env.staging` file:
```env
# Supabase
VITE_SUPABASE_URL=https://[staging-project].supabase.co
VITE_SUPABASE_ANON_KEY=[staging-anon-key]

# Feature Flags
VITE_ENABLE_BETA_FEATURES=true
VITE_ENABLE_DEBUG_LOGS=true

# Environment
VITE_ENVIRONMENT=staging
```

## 🧪 Staging Test Scenarios

### Critical Path Testing:
1. **User Registration & Login**
   - Sign up with email/password
   - Verify email (if enabled)
   - Login with credentials
   - Logout

2. **Trip Creation (Driver)**
   - Create one-way trip (Wasel)
   - Create return trip (Raje3)
   - Add intermediate stops
   - Set price per seat

3. **Trip Booking (Passenger)**
   - Search for trips
   - Apply filters
   - Book available seats
   - Receive confirmation

4. **Communication**
   - Send message to driver/passenger
   - Receive notifications
   - Check notification center

5. **Payment Flow**
   - Add funds to wallet
   - Complete booking payment
   - Verify transaction history

6. **Premium Features**
   - Test business account creation
   - Create recurring trips
   - Use referral code
   - Apply promo code

## 📈 Performance Benchmarks

Target metrics for staging:
- **API Response Time**: < 500ms for 95th percentile
- **Page Load Time**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Error Rate**: < 0.1%
- **Uptime**: > 99.9%

## 🎯 Go-Live Criteria

Before promoting to production:
- [ ] All critical bugs resolved
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] All features tested on staging
- [ ] Load testing completed
- [ ] Backup and recovery plan in place
- [ ] Monitoring and alerts configured
- [ ] Documentation updated
- [ ] Team trained on support procedures

## 📞 Support & Escalation

**Technical Issues**: Create issues in repository
**Critical Bugs**: Immediate rollback + hotfix
**Support Contact**: support@wassel.app

## 🔍 Final Verification Script

Run this checklist before going live:
```bash
# 1. Health check
curl https://[project-id].supabase.co/functions/v1/make-server-0b1f4071/health

# 2. Test signup
# Use Postman/Thunder Client to test the signup endpoint

# 3. Test trip search
# Verify trip search returns results

# 4. Check error logs
# Review server logs for any errors

# 5. Performance test
# Run load testing tool (k6, Artillery, etc.)
```

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Backend API Documentation](/BACKEND_FILE_INDEX.md)
- [Feature Documentation](/COMPLETE_FEATURES_LIST.md)
- [Architecture Overview](/ARCHITECTURE_OVERVIEW.md)

---

**Last Updated**: Pre-Production Readiness Check
**Version**: 1.0.0-staging
**Status**: ✅ Ready for Staging Deployment
