# ⚡ Quick Deploy Checklist - Wassel Platform

## 🚀 STAGING DEPLOYMENT - 5 MINUTE CHECKLIST

Use this quick checklist before deploying to staging. For detailed information, see `/DEPLOYMENT_VERIFICATION.md`.

---

## ✅ PRE-DEPLOYMENT (2 minutes)

### 1. Environment Check
```bash
□ Supabase Project ID configured in /utils/supabase/info.tsx
□ Supabase Anon Key configured
□ Backend server deployed to Supabase Edge Functions
□ Version set to "1.0.0-staging" in /utils/config.ts
```

### 2. Quick Health Check
Open browser console on localhost and run:
```javascript
// Quick backend ping
fetch('https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-0b1f4071/health', {
  headers: { 'Authorization': 'Bearer YOUR_ANON_KEY' }
}).then(r => r.json()).then(console.log);

// Expected: { status: "ok", timestamp: "..." }
```

### 3. Critical Files Check
```bash
□ /App.tsx - Has ErrorBoundary wrapper ✅
□ /services/api.ts - Using make-server-0b1f4071 ✅
□ /components/ErrorBoundary.tsx - Exists ✅
□ /components/StagingBanner.tsx - Exists ✅
```

---

## 🚀 DEPLOYMENT (1 minute)

### Option A: Vercel
```bash
vercel --prod
```

### Option B: Netlify
```bash
netlify deploy --prod
```

### Option C: Custom
```bash
npm run build
# Upload /dist to your hosting
```

---

## ✅ POST-DEPLOYMENT (2 minutes)

### 1. Smoke Test (Critical Flows)
```
□ Site loads without errors
□ Landing page displays
□ Login page accessible
□ Signup works (create test account)
□ Dashboard loads after login
□ No console errors
```

### 2. Quick Validation
Visit your staging URL and open console:
```javascript
// Run automated checks
import { runPreProductionChecks } from './utils/preProductionChecks';
await runPreProductionChecks();

// Look for:
// ✅ DEPLOYMENT STATUS: READY
```

### 3. Environment Banner Check
```
□ Yellow staging banner visible at top ✅
□ Shows "Staging Environment" ✅
□ Shows version "1.0.0-staging" ✅
□ Can be dismissed ✅
```

---

## 🧪 CRITICAL TEST SCENARIOS (5 minutes)

### Scenario 1: User Registration (1 min)
```
1. Click "Get Started"
2. Fill: Name, Email, Password
3. Click "Create Account"
4. ✅ Redirects to dashboard
5. ✅ No errors in console
```

### Scenario 2: Trip Creation (2 min)
```
1. Click "Offer Ride"
2. Fill: From, To, Date, Time, Seats, Price
3. Select "Wasel" (one-way)
4. Click "Publish Trip"
5. ✅ Trip created successfully
6. ✅ Appears in "My Trips"
```

### Scenario 3: Trip Search (1 min)
```
1. Click "Find Ride"
2. Enter: From city, To city
3. Click "Search"
4. ✅ Results display
5. ✅ Can click on trip for details
```

### Scenario 4: Error Handling (1 min)
```
1. Disconnect internet
2. Try to create trip
3. ✅ Error message displays
4. ✅ App doesn't crash
5. ✅ ErrorBoundary catches errors
```

---

## 🔴 ROLLBACK IF...

Stop and rollback immediately if you see:

```
🔴 Backend health check fails
🔴 Users can't sign up
🔴 Users can't login
🔴 White screen of death
🔴 Console flooded with errors
🔴 API calls returning 500 errors
🔴 Database connection failed
```

**Rollback Command:**
```bash
# Vercel
vercel rollback

# Netlify - Use dashboard to rollback

# Or redeploy previous commit
git checkout <previous-commit>
git push -f origin main
```

---

## ✅ SUCCESS INDICATORS

You're good to proceed if:

```
✅ Health check returns { status: "ok" }
✅ Users can sign up and login
✅ Trips can be created and searched
✅ No critical errors in console
✅ Staging banner displays correctly
✅ Mobile responsive works
✅ API latency < 1 second
```

---

## 📊 MONITORING FIRST 24 HOURS

### Hour 1: Watch Closely
```
□ Check error logs every 15 minutes
□ Monitor user signups
□ Test all critical flows
□ Verify backend uptime
```

### Hours 2-8: Regular Checks
```
□ Check logs every hour
□ Monitor for error spikes
□ Track user activity
□ Verify no performance degradation
```

### Hours 9-24: Periodic Checks
```
□ Check logs every 4 hours
□ Review error rate (target: <1%)
□ Check API latency (target: <500ms)
□ Verify system stability
```

---

## 🎯 SUCCESS METRICS

### Day 1 Targets
```
✅ Crash-free rate: >99%
✅ API error rate: <2%
✅ Average latency: <500ms
✅ User signups: Track actual
✅ Trip creations: Track actual
✅ Zero critical bugs
```

---

## 📞 EMERGENCY CONTACTS

**Critical Issue?**
1. Check error logs first
2. Review `/DEPLOYMENT_VERIFICATION.md`
3. Rollback if critical failure
4. Document issue for post-mortem

**Supabase Issues:**
- Dashboard: https://supabase.com/dashboard
- Support: support@supabase.com

---

## 🎉 DEPLOYMENT SUCCESSFUL!

If all checks pass:

1. ✅ **Celebrate with team** 🎊
2. ✅ **Announce to stakeholders**
3. ✅ **Begin user testing**
4. ✅ **Gather feedback**
5. ✅ **Plan next iteration**

---

## 📝 QUICK LINKS

- Full Checklist: `/DEPLOYMENT_VERIFICATION.md`
- Status Report: `/STAGING_READY.md`
- Fix Summary: `/PRE_PRODUCTION_FIXES_SUMMARY.md`
- Production Readiness: `/PRODUCTION_READINESS_CHECKLIST.md`

---

**Last Updated:** November 6, 2025  
**Version:** 1.0.0-staging  
**Status:** ✅ Ready for Staging Deployment

---

## 💡 PRO TIPS

1. **Always run validation before deploy**
   ```javascript
   await runPreProductionChecks();
   ```

2. **Keep staging URL handy**
   ```
   Bookmark your staging URL for quick access
   ```

3. **Test on real devices**
   ```
   Use actual phones/tablets, not just browser dev tools
   ```

4. **Monitor error logs**
   ```
   Open browser console + Supabase dashboard logs
   ```

5. **Have rollback plan ready**
   ```
   Know how to rollback before you deploy
   ```

---

**🚀 READY? LET'S DEPLOY!**

```bash
# Run this when ready
vercel --prod
# or
netlify deploy --prod
```

**Good luck! 🍀**
