# Wassel AI Governance & Deployment Guide

## Overview
This document outlines the governance framework, deployment strategy, monitoring, and compliance requirements for Wassel's AI integration.

---

## 1. AI Governance Framework

### 1.1 Feature-Level Toggles

#### Global Feature Flags (Admin Control)
Located in `ai_config` table, managed through admin panel:

```typescript
interface AIGlobalConfig {
  enabled: boolean;              // Master AI kill switch
  features: {
    smartRoutes: boolean;         // Toggle route suggestions
    dynamicPricing: boolean;      // Toggle AI pricing
    riskAssessment: boolean;      // Toggle fraud detection
    nlpSearch: boolean;           // Toggle NLP search
    recommendations: boolean;     // Toggle recommendations
    predictive: boolean;          // Toggle predictive analytics
    smartMatching: boolean;       // Toggle smart matching
    conversationAI: boolean;      // Toggle conversation AI
  };
}
```

**Usage:**
```sql
-- Disable all AI features globally
UPDATE ai_config SET enabled = false WHERE id = '00000000-0000-0000-0000-000000000001';

-- Disable specific feature
UPDATE ai_config 
SET features = jsonb_set(features, '{dynamicPricing}', 'false')
WHERE id = '00000000-0000-0000-0000-000000000001';
```

#### User-Level Preferences
Users can control AI features individually:

```typescript
interface UserAIPreferences {
  ai_enabled: boolean;           // User opt-in/out
  features_enabled: {
    smartRoutes: boolean;
    dynamicPricing: boolean;
    // ... all features
  };
  data_sharing_allowed: boolean; // Model training consent
}
```

**UI Implementation:**
- Settings screen with toggle switches
- Granular control per feature
- Clear explanations of each feature
- Opt-out option prominently displayed

### 1.2 User Consent & Transparency

#### Consent Flow
1. **First Launch**: Show AI intro screen
   - Explain AI features and benefits
   - Describe data usage (anonymized)
   - Present opt-in choice (default: ON)
   - Link to privacy policy

2. **Ongoing Consent**:
   - Settings > AI Features
   - Toggle individual features
   - View data usage summary
   - Request data deletion

#### Transparency Requirements
- **AI Badges**: Show sparkle icon or "AI" badge on AI-powered features
- **Confidence Display**: Show confidence scores when relevant (e.g., pricing)
- **Source Attribution**: Indicate when using AI vs. rule-based fallback
- **Explanation**: Provide "Why am I seeing this?" tooltips

#### Data Usage Disclosure
```plaintext
AI Feature          Data Collected                    Data Retention
-------------       -----------------                 ---------------
Smart Routes        Search queries, location          30 days
Dynamic Pricing     Trip details, preferences         60 days
Risk Assessment     Device info, behavior patterns    90 days
Recommendations     Trip history, preferences         90 days
NLP Search          Search queries (anonymized)       30 days
Conversation AI     Message metadata (not content)    7 days
```

### 1.3 Privacy & Compliance

#### GDPR Compliance
- ✅ Right to access (data export)
- ✅ Right to erasure (data deletion)
- ✅ Right to rectification (data correction)
- ✅ Right to restrict processing (opt-out)
- ✅ Right to data portability (JSON export)
- ✅ Right to object (granular controls)

#### CCPA Compliance
- ✅ Notice at collection (consent screen)
- ✅ Right to know (data access)
- ✅ Right to delete (data deletion)
- ✅ Right to opt-out (toggle switches)
- ✅ Non-discrimination (full functionality without AI)

#### Data Processing
- **Encryption**: All AI data encrypted at rest and in transit
- **Anonymization**: PII removed before model training
- **Retention**: Automatic deletion after retention period
- **Third Parties**: No data sharing with external AI providers (in-house models)

#### User Rights Implementation
```typescript
// Data export
async function exportUserAIData(userId: string) {
  const logs = await supabase
    .from('ai_logs')
    .select('*')
    .eq('user_id', userId);
  
  const preferences = await supabase
    .from('user_ai_preferences')
    .select('*')
    .eq('user_id', userId);
  
  return {
    logs: logs.data,
    preferences: preferences.data,
    export_date: new Date().toISOString()
  };
}

// Data deletion
async function deleteUserAIData(userId: string) {
  await supabase.from('ai_logs').delete().eq('user_id', userId);
  await supabase.from('user_ai_preferences').delete().eq('user_id', userId);
  await supabase.from('ai_recommendations_cache').delete().eq('user_id', userId);
  // ... delete from all AI tables
}
```

---

## 2. AI Model Management

### 2.1 Model Versioning

All AI models are versioned and tracked:

```typescript
interface AIModelVersion {
  name: string;           // e.g., "routeOptimization"
  version: string;        // e.g., "v3.2"
  deployment_date: Date;
  accuracy: number;       // e.g., 0.94
  latency_p95: number;    // e.g., 150ms
  fallback_rate: number;  // e.g., 0.05
  status: 'active' | 'deprecated' | 'canary';
}
```

**Model Registry:**
```json
{
  "routeOptimization": {
    "current": "bert-multilingual-v3.2",
    "previous": "bert-multilingual-v3.1",
    "canary": null
  },
  "pricingModel": {
    "current": "xgboost-v2.1",
    "previous": "xgboost-v2.0",
    "canary": "xgboost-v2.2"
  }
}
```

### 2.2 A/B Testing & Canary Deployment

#### Canary Deployment Strategy
1. Deploy new model to 5% of traffic
2. Monitor metrics for 24 hours
3. If metrics improve, increase to 25%
4. Continue gradual rollout to 100%
5. If metrics degrade, rollback to previous version

#### Metrics to Monitor
- **Accuracy**: Prediction correctness
- **Latency**: Response time (p50, p95, p99)
- **Fallback Rate**: How often fallback is triggered
- **User Satisfaction**: Implicit signals (click-through, acceptance)
- **Error Rate**: Failed requests

#### Implementation
```typescript
function selectAIModel(feature: string, userId: string): string {
  const config = getAIConfig();
  const userBucket = hashUserId(userId) % 100;
  
  if (config.canary[feature] && userBucket < 5) {
    return config.canary[feature]; // 5% canary traffic
  }
  
  return config.models[feature]; // 95% stable traffic
}
```

### 2.3 Model Retraining Pipeline

#### Retraining Cadence
- **Smart Routes**: Weekly (high data volume)
- **Dynamic Pricing**: Bi-weekly
- **Risk Assessment**: Monthly
- **Recommendations**: Weekly
- **NLP Search**: Monthly

#### Retraining Process
1. **Data Collection**: Aggregate logs from `ai_logs` table
2. **Data Cleaning**: Remove outliers, anonymize PII
3. **Feature Engineering**: Extract relevant features
4. **Model Training**: Train on updated dataset
5. **Validation**: Test on held-out data
6. **Deployment**: Canary → Gradual rollout

#### Triggering Retraining
```sql
-- Automatic trigger when model performance degrades
CREATE OR REPLACE FUNCTION check_model_performance()
RETURNS void AS $$
DECLARE
    v_accuracy DECIMAL;
    v_fallback_rate DECIMAL;
BEGIN
    -- Calculate current accuracy
    SELECT 
        COUNT(*) FILTER (WHERE confidence > 0.8)::numeric / COUNT(*)::numeric
    INTO v_accuracy
    FROM ai_logs
    WHERE feature = 'dynamic_pricing'
    AND created_at > NOW() - INTERVAL '7 days';
    
    -- Calculate fallback rate
    SELECT 
        COUNT(*) FILTER (WHERE source = 'rule-based')::numeric / COUNT(*)::numeric
    INTO v_fallback_rate
    FROM ai_logs
    WHERE feature = 'dynamic_pricing'
    AND created_at > NOW() - INTERVAL '7 days';
    
    -- Trigger alert if performance degrades
    IF v_accuracy < 0.7 OR v_fallback_rate > 0.2 THEN
        -- Send alert to AI team
        PERFORM pg_notify('model_degradation', 
            json_build_object(
                'feature', 'dynamic_pricing',
                'accuracy', v_accuracy,
                'fallback_rate', v_fallback_rate
            )::text
        );
    END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 3. Monitoring & Logging

### 3.1 Real-Time Monitoring Dashboard

#### Key Metrics to Track

**System Health**
- AI service uptime (target: 99.9%)
- API response time (target: <3s p95)
- Error rate (target: <0.1%)
- Fallback rate (target: <10%)

**Model Performance**
- Confidence score distribution
- Accuracy per feature
- Latency per feature
- User acceptance rate

**Business Impact**
- AI-influenced bookings
- Dynamic pricing adoption
- User satisfaction delta
- Revenue impact

#### Dashboard Queries

```sql
-- Real-time AI health overview
CREATE OR REPLACE VIEW ai_health_dashboard AS
SELECT
    feature,
    COUNT(*) as requests_last_hour,
    ROUND(AVG(latency)::numeric, 2) as avg_latency_ms,
    ROUND(AVG(confidence)::numeric, 2) as avg_confidence,
    COUNT(*) FILTER (WHERE success = false) as errors,
    COUNT(*) FILTER (WHERE source = 'rule-based') as fallbacks
FROM ai_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY feature;

-- AI adoption metrics
SELECT
    DATE(created_at) as date,
    COUNT(DISTINCT user_id) as active_ai_users,
    COUNT(*) as total_ai_requests,
    ROUND(AVG(latency)::numeric, 2) as avg_latency
FROM ai_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 3.2 Alerting Rules

#### Critical Alerts (PagerDuty)
- AI service down (no requests in 5 min)
- Error rate > 5% for 10 minutes
- Latency p95 > 10s for 5 minutes
- Fallback rate > 50% for 15 minutes

#### Warning Alerts (Slack)
- Confidence score < 0.5 for any feature
- Fallback rate > 20% for 30 minutes
- Unusual traffic spike (>200% baseline)

#### Alert Implementation
```typescript
// Example monitoring setup with Prometheus/Grafana
export const aiMetrics = {
  requestsTotal: new Counter({
    name: 'ai_requests_total',
    help: 'Total AI requests',
    labelNames: ['feature', 'source', 'success']
  }),
  
  requestDuration: new Histogram({
    name: 'ai_request_duration_ms',
    help: 'AI request duration in milliseconds',
    labelNames: ['feature'],
    buckets: [100, 500, 1000, 2000, 5000, 10000]
  }),
  
  confidenceScore: new Gauge({
    name: 'ai_confidence_score',
    help: 'AI model confidence score',
    labelNames: ['feature']
  })
};

// Record metrics
function recordAIMetrics(feature: string, response: AIResponse) {
  aiMetrics.requestsTotal.inc({
    feature,
    source: response.source,
    success: response.success
  });
  
  aiMetrics.requestDuration.observe(
    { feature },
    response.latency
  );
  
  if (response.confidence) {
    aiMetrics.confidenceScore.set(
      { feature },
      response.confidence
    );
  }
}
```

### 3.3 Logging Best Practices

#### What to Log
✅ All AI requests and responses  
✅ Confidence scores  
✅ Latency measurements  
✅ Fallback occurrences  
✅ User actions following AI suggestions  

#### What NOT to Log
❌ Full message content (only metadata)  
❌ Unencrypted PII  
❌ Payment card details  
❌ Passwords or tokens  

#### Log Retention Policy
- **Production logs**: 90 days
- **AI training data**: Anonymized, indefinite
- **Error logs**: 1 year
- **Audit logs**: 7 years (compliance)

---

## 4. Deployment Strategy

### 4.1 Backend Deployment

#### Infrastructure Requirements
```yaml
AI Backend Service:
  - Cloud: AWS / GCP / Azure
  - Compute: Kubernetes cluster
  - GPU: For model inference (optional, use CPU for simpler models)
  - Load Balancer: NGINX or AWS ALB
  - Caching: Redis for response caching
  - Monitoring: Prometheus + Grafana
```

#### Deployment Steps
```bash
# 1. Build AI service Docker image
docker build -t wassel-ai-service:v1.0 .

# 2. Push to container registry
docker push registry.wassel.app/ai-service:v1.0

# 3. Deploy to Kubernetes
kubectl apply -f k8s/ai-service-deployment.yaml

# 4. Update service configuration
kubectl set image deployment/ai-service \
  ai-service=registry.wassel.app/ai-service:v1.0

# 5. Monitor rollout
kubectl rollout status deployment/ai-service

# 6. Run health check
curl https://ai.wassel.app/v1/health
```

#### Kubernetes Deployment Config
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-service
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: ai-service
  template:
    metadata:
      labels:
        app: ai-service
    spec:
      containers:
      - name: ai-service
        image: registry.wassel.app/ai-service:v1.0
        ports:
        - containerPort: 8080
        env:
        - name: MODEL_PATH
          value: /models
        - name: DB_URL
          valueFrom:
            secretKeyRef:
              name: ai-secrets
              key: database-url
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 4.2 Frontend Deployment

#### Web Application
```bash
# 1. Install dependencies
npm install

# 2. Build with AI features enabled
REACT_APP_AI_ENABLED=true npm run build

# 3. Deploy to hosting (Vercel/Netlify/AWS)
vercel deploy --prod

# 4. Verify AI context is loaded
# Check browser console for "AI Context initialized"
```

#### Environment Variables
```env
# Production
REACT_APP_AI_API_URL=https://ai.wassel.app/v1
REACT_APP_AI_ENABLED=true
REACT_APP_AI_TIMEOUT=5000

# Staging
REACT_APP_AI_API_URL=https://ai-staging.wassel.app/v1
REACT_APP_AI_ENABLED=true
REACT_APP_AI_TIMEOUT=10000

# Development
REACT_APP_AI_API_URL=http://localhost:8080
REACT_APP_AI_ENABLED=false
REACT_APP_AI_TIMEOUT=30000
```

### 4.3 Mobile Deployment

#### iOS
```bash
# 1. Update AI endpoint configuration
# File: Config.swift
let AI_BASE_URL = "https://ai.wassel.app/v1"

# 2. Build for TestFlight
xcodebuild -scheme Wassel -configuration Release

# 3. Upload to App Store Connect
# Enable "AI Features" in app description

# 4. Request App Store Review
# Include AI feature explanations
```

#### Android
```bash
# 1. Update build.gradle
def AI_BASE_URL = "https://ai.wassel.app/v1"

# 2. Build release APK
./gradlew assembleRelease

# 3. Upload to Play Console
# Update "What's New" with AI features

# 4. Submit for review
```

### 4.4 Database Migration

#### Run AI Schema
```bash
# 1. Connect to production database
psql $DATABASE_URL

# 2. Run AI schema migration
\i supabase/ai_schema.sql

# 3. Verify tables created
\dt ai_*

# 4. Check RLS policies
\d ai_logs

# 5. Test functions
SELECT get_user_ai_preferences('00000000-0000-0000-0000-000000000001');
```

#### Rollback Plan
```sql
-- Drop all AI tables if needed
DROP TABLE IF EXISTS ai_logs CASCADE;
DROP TABLE IF EXISTS ai_config CASCADE;
DROP TABLE IF EXISTS user_ai_preferences CASCADE;
-- ... drop all AI tables

-- Drop functions
DROP FUNCTION IF EXISTS log_ai_interaction CASCADE;
DROP FUNCTION IF EXISTS get_user_ai_preferences CASCADE;
-- ... drop all AI functions
```

---

## 5. Testing & Quality Assurance

### 5.1 AI Feature Testing Checklist

#### Functional Testing
- [ ] Smart routes return relevant suggestions
- [ ] Dynamic pricing calculates reasonable prices
- [ ] Risk assessment flags high-risk users
- [ ] NLP search parses queries correctly (EN + AR)
- [ ] Recommendations are personalized
- [ ] Smart matching ranks results properly
- [ ] Conversation AI suggests relevant replies
- [ ] Fallback mechanisms work when AI fails

#### Performance Testing
- [ ] Latency < 3s for all features (p95)
- [ ] No blocking on AI calls (async execution)
- [ ] Cache hit rate > 30%
- [ ] Concurrent users: 1000+ without degradation

#### Security Testing
- [ ] PII is not logged
- [ ] API requires authentication
- [ ] Rate limiting prevents abuse
- [ ] SQL injection protected
- [ ] XSS protected in AI outputs

#### Privacy Testing
- [ ] User consent is recorded
- [ ] Opt-out disables AI features
- [ ] Data export includes AI data
- [ ] Data deletion removes AI logs

### 5.2 Load Testing

#### Load Test Scenario
```javascript
// Using k6 for load testing
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 500 },  // Peak load
    { duration: '2m', target: 0 },    // Ramp down
  ],
};

export default function () {
  // Test smart routes
  let payload = JSON.stringify({
    feature: 'smart_routes',
    input: { query: 'dubai' },
  });
  
  let res = http.post('https://ai.wassel.app/v1/routes/suggest', payload, {
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.API_TOKEN}`
    },
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'latency < 3s': (r) => r.timings.duration < 3000,
    'confidence > 0.5': (r) => JSON.parse(r.body).confidence > 0.5,
  });
  
  sleep(1);
}
```

---

## 6. Incident Response

### 6.1 AI Service Outage

**Response Plan:**
1. **Detect**: Monitoring alerts trigger
2. **Assess**: Check AI service health dashboard
3. **Mitigate**: Enable fallback mode globally
   ```sql
   UPDATE ai_config SET enabled = false;
   ```
4. **Investigate**: Check logs, database, network
5. **Fix**: Deploy fix or rollback
6. **Restore**: Re-enable AI features
7. **Post-Mortem**: Document incident and improvements

### 6.2 Model Performance Degradation

**Response Plan:**
1. **Detect**: Confidence scores drop below threshold
2. **Assess**: Review recent model changes
3. **Rollback**: Revert to previous model version
   ```typescript
   updateAIConfig({
     models: {
       pricingModel: 'xgboost-v2.0' // rollback from v2.1
     }
   });
   ```
4. **Investigate**: Analyze training data issues
5. **Retrain**: Fix data issues and retrain
6. **Redeploy**: Canary deployment of fixed model

### 6.3 Data Privacy Breach

**Response Plan:**
1. **Contain**: Immediately disable affected feature
2. **Notify**: Inform users within 72 hours (GDPR)
3. **Investigate**: Identify scope of breach
4. **Remediate**: Fix vulnerability
5. **Audit**: External security audit
6. **Improve**: Implement additional safeguards

---

## 7. Cost Management

### 7.1 AI Cost Breakdown

**Infrastructure Costs:**
- Compute: $500/month (3 replicas, 2GB RAM each)
- GPU (if needed): $1000/month (optional)
- Storage: $50/month (logs, cache)
- Network: $100/month (egress)
- **Total**: ~$650/month (without GPU)

**Model Serving Costs:**
- Inference API calls: $0.001 per request
- Expected volume: 1M requests/month
- **Total**: ~$1000/month

**Data Storage:**
- AI logs (90 days): ~50GB = $5/month
- Cache: Redis 2GB = $20/month
- **Total**: ~$25/month

**Grand Total**: ~$1675/month

### 7.2 Cost Optimization

**Strategies:**
- **Caching**: 30% cache hit rate = 30% cost savings
- **Fallback Usage**: Use rule-based for low-value requests
- **Batching**: Batch inference for non-realtime features
- **Auto-scaling**: Scale down during low traffic
- **Model Compression**: Use quantized models (faster, cheaper)

---

## 8. Success Metrics

### 8.1 Technical Metrics
- **Uptime**: 99.9%
- **Latency p95**: <3s
- **Error Rate**: <0.5%
- **Fallback Rate**: <15%
- **Cache Hit Rate**: >30%

### 8.2 Business Metrics
- **AI Adoption**: >70% of users enable AI
- **Booking Conversion**: +10% with AI recommendations
- **User Satisfaction**: +15% (NPS increase)
- **Revenue Impact**: +5% from dynamic pricing

### 8.3 Model Metrics
- **Accuracy**: >85% for all models
- **Confidence**: >0.7 average
- **User Acceptance**: >60% click-through on suggestions

---

## 9. Documentation & Training

### 9.1 Team Training
- [ ] Backend team: AI API contracts workshop
- [ ] Frontend team: AI hooks integration tutorial
- [ ] Mobile team: iOS/Android AI service setup
- [ ] QA team: AI testing procedures
- [ ] Support team: AI feature troubleshooting

### 9.2 User Documentation
- [ ] Help center: AI features explainer
- [ ] FAQ: Common AI questions
- [ ] Privacy policy: Updated with AI data usage
- [ ] Terms of service: AI disclaimer

---

## 10. Roadmap

### Phase 1: MVP (Completed)
- ✅ AI service layer architecture
- ✅ Core AI features implemented
- ✅ Database schema created
- ✅ Mobile integration guides
- ✅ Governance framework

### Phase 2: Production Deployment (2-4 weeks)
- [ ] Deploy AI backend service
- [ ] Migrate database schema
- [ ] Integrate AI hooks in web app
- [ ] Mobile app integration (iOS + Android)
- [ ] Load testing and optimization
- [ ] User acceptance testing

### Phase 3: Monitoring & Optimization (4-8 weeks)
- [ ] Set up monitoring dashboards
- [ ] Configure alerting
- [ ] A/B test model versions
- [ ] Optimize caching strategies
- [ ] Measure business impact

### Phase 4: Advanced Features (3-6 months)
- [ ] Multi-modal AI (image + text)
- [ ] Voice assistant integration
- [ ] Real-time translation
- [ ] Predictive maintenance
- [ ] Advanced fraud detection

---

## Contact & Support

**AI Team Lead**: ai-team@wassel.app  
**DevOps**: devops@wassel.app  
**Security**: security@wassel.app  
**Legal/Compliance**: legal@wassel.app  

**Slack Channels**:
- #wassel-ai-integration
- #ai-alerts
- #ai-incidents

**Documentation**:
- `/AI_INTERACTION_MAP.md`
- `/AI_API_CONTRACTS.md`
- `/AI_MOBILE_INTEGRATION.md`
- `/supabase/ai_schema.sql`
