# Wassel AI Integration - Quick Start Guide

## 🚀 For Developers: Get Started in 15 Minutes

This guide will get you up and running with Wassel's AI integration quickly.

---

## Prerequisites

- Node.js 18+ installed
- Supabase project set up
- Basic understanding of React hooks
- Access to Wassel backend API

---

## Step 1: Database Setup (5 minutes)

### Run AI Schema Migration

```bash
# Connect to your Supabase database
# Option 1: Using Supabase Dashboard
# 1. Go to SQL Editor in Supabase Dashboard
# 2. Copy contents of /supabase/ai_schema.sql
# 3. Click "Run"

# Option 2: Using psql
psql $SUPABASE_DATABASE_URL -f supabase/ai_schema.sql

# Verify tables created
psql $SUPABASE_DATABASE_URL -c "\dt ai_*"
```

Expected output:
```
                List of relations
 Schema |           Name            | Type  | Owner
--------+---------------------------+-------+-------
 public | ai_config                 | table | postgres
 public | ai_logs                   | table | postgres
 public | ai_recommendations_cache  | table | postgres
 public | user_ai_preferences       | table | postgres
```

---

## Step 2: Backend Setup (Mock Mode - 5 minutes)

Since the AI backend is not yet deployed, the frontend will use **rule-based fallbacks** automatically.

### Configure Environment

Create `.env.local`:

```env
# AI Backend (not deployed yet, will fallback)
REACT_APP_AI_API_URL=https://ai.wassel.app/v1
REACT_APP_AI_ENABLED=true
REACT_APP_AI_TIMEOUT=5000
REACT_APP_AI_FALLBACK=true
```

> **Note**: With `AI_FALLBACK=true`, all AI features will gracefully degrade to rule-based logic until the backend is deployed.

---

## Step 3: Frontend Integration (5 minutes)

### Verify AI Context is Loaded

The AI context is already wired into `App.tsx`. Verify it's working:

```typescript
// In any component
import { useAI } from '../contexts/AIContext';

function MyComponent() {
  const { isAIEnabled, features, config } = useAI();
  
  console.log('AI Enabled:', isAIEnabled);
  console.log('Available Features:', features);
  
  return <div>AI Status: {isAIEnabled ? 'Active' : 'Inactive'}</div>;
}
```

### Test AI Hooks

Try using an AI hook in a component:

```typescript
import { useSmartRoutes } from '../hooks/useAIFeatures';

function SearchBar() {
  const { suggestions, getSuggestions } = useSmartRoutes();
  
  return (
    <input
      onChange={(e) => getSuggestions(e.target.value)}
      placeholder="Search location..."
    />
    
    {suggestions.map(s => (
      <div key={s.location}>{s.location}</div>
    ))}
  );
}
```

**Current Behavior**: Will use fallback (fuzzy search) since backend is not deployed yet.

---

## Step 4: Testing (Optional - 5 minutes)

### Test AI Service Layer

```typescript
import { aiService } from '../services/aiService';

// Test smart routes (will use fallback)
const suggestions = await aiService.getSmartRouteSuggestions('dub');
console.log('Suggestions:', suggestions);
// Expected: { success: true, data: [...], source: 'rule-based' }

// Test dynamic pricing (will use fallback)
const pricing = await aiService.getDynamicPricing({
  from: 'Dubai',
  to: 'Abu Dhabi',
  distance_km: 140,
  departureTime: new Date().toISOString(),
  seats: 2,
  tripType: 'passenger'
});
console.log('Pricing:', pricing);
// Expected: { success: true, data: { price: 165, ... }, source: 'rule-based' }
```

---

## What's Working Now (Without AI Backend)

✅ **All UI components** - No changes needed  
✅ **AI Context Provider** - Manages state  
✅ **AI Hooks** - Return fallback data  
✅ **Database Schema** - Ready for logging  
✅ **User Preferences** - Can toggle AI on/off  
✅ **Graceful Degradation** - Falls back to rule-based  

❌ **AI Model Inference** - Requires backend deployment  
❌ **Advanced Features** - NLP, smart matching, etc.  
❌ **Confidence Scores** - Always returns 0.5 in fallback  

---

## How AI Integration Works

### Architecture Flow

```
User Action (e.g., types in search box)
    ↓
AI Hook (e.g., useSmartRoutes)
    ↓
AI Service Layer (services/aiService.ts)
    ↓
API Request to AI Backend
    ↓
    ├─ Success → Return AI result
    └─ Failure/Timeout → Return fallback result
        ↓
Update UI with result
```

### Example: Smart Routes Feature

**User types "dub" in search box:**

1. `FindRide.tsx` calls `getSuggestions('dub')`
2. `useSmartRoutes` hook debounces and calls `aiService.getSmartRouteSuggestions('dub')`
3. `aiService` makes POST request to `https://ai.wassel.app/v1/routes/suggest`
4. **If backend responds**: Return AI suggestions with high confidence
5. **If backend fails**: Return fallback suggestions (fuzzy match on cities)
6. UI displays suggestions regardless of source

**No UI changes needed!** The component just receives suggestions.

---

## Using AI Features in Components

### 1. Smart Routes (Autocomplete)

```typescript
// In FindRide.tsx
import { useSmartRoutes } from '../hooks/useAIFeatures';

const { suggestions, getSuggestions, loading } = useSmartRoutes();

<Input
  value={searchFrom}
  onChange={(e) => {
    setSearchFrom(e.target.value);
    getSuggestions(e.target.value, userLocation);
  }}
/>

{suggestions.length > 0 && (
  <div className="suggestions">
    {suggestions.map(s => (
      <div 
        key={s.location}
        onClick={() => setSearchFrom(s.location)}
      >
        {s.location}
        {s.confidence > 0.8 && <Badge>AI</Badge>}
      </div>
    ))}
  </div>
)}
```

### 2. Dynamic Pricing

```typescript
// In OfferRide.tsx
import { useDynamicPricing } from '../hooks/useAIFeatures';

const { pricing, calculatePrice } = useDynamicPricing();

useEffect(() => {
  if (from && to && distance) {
    calculatePrice({ from, to, distance_km: distance, ...tripData });
  }
}, [from, to, distance]);

return (
  <div>
    {pricing && pricing.confidence > 0.7 ? (
      <div>
        <h3>AI Suggested Price</h3>
        <p>AED {pricing.price}</p>
        <Badge>Optimized</Badge>
      </div>
    ) : (
      <Input type="number" placeholder="Enter price" />
    )}
  </div>
);
```

### 3. Risk Assessment (Background)

```typescript
// In AuthPage.tsx
import { useRiskAssessment } from '../hooks/useAIFeatures';

const { assessRisk } = useRiskAssessment();

async function handleSignup(formData) {
  // Assess risk before creating account
  const risk = await assessRisk('signup', {
    email: formData.email,
    phone: formData.phone
  });
  
  if (risk.riskScore > 0.9) {
    // Block signup
    toast.error('Account verification required');
    return;
  }
  
  if (risk.riskScore > 0.7) {
    // Require additional verification
    setVerificationRequired(true);
  }
  
  // Proceed with signup
  await createAccount(formData);
}
```

### 4. Personalized Recommendations

```typescript
// In Dashboard.tsx
import { usePersonalizedRecommendations } from '../hooks/useAIFeatures';

const { recommendations, loading } = usePersonalizedRecommendations();

return (
  <div>
    <h3>Recommended for You</h3>
    {loading ? (
      <Skeleton count={3} />
    ) : (
      recommendations.map(rec => (
        <TripCard 
          key={rec.tripId || rec.route}
          trip={rec}
          badge={rec.score > 0.8 ? 'Perfect Match' : null}
        />
      ))
    )}
  </div>
);
```

### 5. NLP Search

```typescript
// In FindRide.tsx
import { useNLPSearch } from '../hooks/useAIFeatures';

const { parseQuery } = useNLPSearch();

<Input
  placeholder="Try: 'Dubai to Abu Dhabi tomorrow morning'"
  onKeyDown={async (e) => {
    if (e.key === 'Enter') {
      const parsed = await parseQuery(e.target.value);
      if (parsed) {
        setSearchFrom(parsed.from || '');
        setSearchTo(parsed.to || '');
        setSearchDate(parsed.date || '');
      }
    }
  }}
/>
```

---

## AI Feature Toggles

### User-Level Toggles

Add to Settings.tsx:

```typescript
import { useAI } from '../contexts/AIContext';

function AISettingsSection() {
  const { userConsent, setUserConsent, features } = useAI();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Features</CardTitle>
        <CardDescription>
          Enhance your experience with AI-powered features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Master toggle */}
        <div className="flex items-center justify-between">
          <Label>Enable AI Features</Label>
          <Switch
            checked={userConsent}
            onCheckedChange={setUserConsent}
          />
        </div>
        
        {/* Individual feature toggles */}
        {userConsent && (
          <div className="space-y-3 ml-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Smart route suggestions</Label>
              <Switch checked={features.smartRoutes} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Dynamic pricing</Label>
              <Switch checked={features.dynamicPricing} />
            </div>
            {/* Add more features */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## Monitoring AI Features

### Check AI Health

```typescript
import { useAI } from '../contexts/AIContext';

function AIHealthIndicator() {
  const { isAIEnabled, loading, error } = useAI();
  
  if (loading) return <span>Checking AI...</span>;
  if (error) return <span className="text-red-500">AI Error</span>;
  
  return (
    <span className={isAIEnabled ? 'text-green-500' : 'text-gray-400'}>
      {isAIEnabled ? '🟢 AI Active' : '⚪ AI Disabled'}
    </span>
  );
}
```

### View AI Logs (Admin)

```typescript
// Query AI logs
const { data: logs } = await supabase
  .from('ai_logs')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(100);

console.table(logs);
```

---

## Deployment Checklist

### Before Deploying AI Features

- [ ] Database migration completed (`ai_schema.sql`)
- [ ] AI Context provider added to App.tsx ✅
- [ ] Environment variables configured
- [ ] AI hooks imported where needed
- [ ] Fallback mechanisms tested
- [ ] User consent flow implemented
- [ ] Settings page has AI toggles
- [ ] Privacy policy updated (mention AI)

### When AI Backend is Ready

- [ ] Update `REACT_APP_AI_API_URL` to production URL
- [ ] Test all AI features with real backend
- [ ] Monitor latency and error rates
- [ ] A/B test AI vs. non-AI flows
- [ ] Measure business impact

---

## Troubleshooting

### AI Features Not Working

**Check 1: Is AI enabled?**
```typescript
const { isAIEnabled } = useAI();
console.log('AI Enabled:', isAIEnabled);
```

**Check 2: Is backend reachable?**
```bash
curl https://ai.wassel.app/v1/health
```

**Check 3: Are there errors in console?**
- Open browser DevTools
- Look for "AI" related errors
- Check Network tab for failed requests

**Check 4: Is user consent given?**
```sql
SELECT * FROM user_ai_preferences WHERE user_id = 'YOUR_USER_ID';
```

### Fallback Always Triggered

This is **expected** if:
- AI backend is not deployed yet
- Network timeout (> 5s)
- Backend returned error
- Confidence score too low

**Solution**: Deploy AI backend or continue using fallbacks.

---

## Next Steps

### Immediate (No Backend Needed)
1. ✅ Add AI Context to App.tsx (Done)
2. ✅ Create database schema (Done)
3. ✅ Implement AI hooks (Done)
4. Test fallback mechanisms
5. Add AI toggle UI to Settings
6. Update privacy policy

### Short-Term (Requires Backend)
1. Deploy AI backend service
2. Implement model endpoints
3. Test end-to-end AI flow
4. Monitor performance
5. A/B test features

### Long-Term
1. Train custom models on Wassel data
2. Implement advanced features (voice, vision)
3. Multi-language NLP
4. Predictive maintenance
5. Real-time fraud detection

---

## Resources

### Documentation
- [AI Interaction Map](/AI_INTERACTION_MAP.md) - Feature-by-feature breakdown
- [API Contracts](/AI_API_CONTRACTS.md) - Backend API specifications
- [Mobile Integration](/AI_MOBILE_INTEGRATION.md) - iOS/Android guides
- [Governance](/AI_GOVERNANCE.md) - Deployment & compliance
- [Database Schema](/supabase/ai_schema.sql) - SQL schema

### Code References
- AI Service: `/services/aiService.ts`
- AI Context: `/contexts/AIContext.tsx`
- AI Hooks: `/hooks/useAIFeatures.ts`

### Support
- Slack: `#wassel-ai-integration`
- Email: `ai-team@wassel.app`
- Docs: `https://docs.wassel.app/ai`

---

## FAQ

**Q: Can I use AI features without the backend?**  
A: Yes! All features have rule-based fallbacks. The app works fully without AI.

**Q: How do I disable AI for a user?**  
A: User can toggle in Settings, or admin can update `user_ai_preferences` table.

**Q: How much does AI cost?**  
A: Estimated $1675/month for infrastructure + inference. See `/AI_GOVERNANCE.md`.

**Q: Is AI GDPR compliant?**  
A: Yes, with user consent, data deletion, and anonymization. See Governance doc.

**Q: What if AI is slow?**  
A: Timeout after 5s and use fallback. Monitor latency in `ai_logs` table.

**Q: How do I add a new AI feature?**  
A: 1) Add to `aiService.ts`, 2) Create hook in `useAIFeatures.ts`, 3) Use in component.

---

## Summary

**You now have:**
✅ Complete AI architecture  
✅ Frontend integration ready  
✅ Mobile integration guides  
✅ Database schema deployed  
✅ Fallback mechanisms  
✅ Governance framework  

**Next action:**
🚀 Deploy AI backend to activate features OR continue with fallbacks.

**Time to production-ready AI**: 2-4 weeks (backend deployment + testing)

---

Happy coding! 🎉
