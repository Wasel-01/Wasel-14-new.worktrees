# Wassel AI API Contracts

## Overview
This document defines the complete API contract between the frontend (Web/iOS/Android) and the AI backend services.

## Base Configuration

```typescript
BASE_URL: https://ai.wassel.app/v1
TIMEOUT: 5000ms (with fallback)
RETRY_POLICY: 2 retries with exponential backoff
HEADERS:
  - Authorization: Bearer {jwt_token}
  - Content-Type: application/json
  - X-User-ID: {user_id}
  - X-Language: en | ar
  - X-Device-Type: web | ios | android
```

## Authentication

All AI endpoints require a valid JWT token from Supabase Auth.

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 1. Smart Route Suggestions

### Endpoint
```
POST /routes/suggest
```

### Request
```json
{
  "feature": "smart_routes",
  "input": {
    "query": "dub",
    "userLocation": {
      "lat": 25.2048,
      "lng": 55.2708
    }
  },
  "context": {
    "language": "en",
    "timestamp": "2026-01-01T10:00:00Z",
    "deviceType": "web"
  },
  "options": {
    "timeout": 2000,
    "fallback": true,
    "cacheEnabled": true
  }
}
```

### Response (Success)
```json
{
  "success": true,
  "result": [
    {
      "location": "Dubai",
      "type": "city",
      "confidence": 0.95
    },
    {
      "location": "Dubai Marina",
      "type": "district",
      "confidence": 0.88
    },
    {
      "location": "Dubai International Airport",
      "type": "landmark",
      "confidence": 0.82
    }
  ],
  "confidence": 0.95,
  "source": "ai",
  "metadata": {
    "modelVersion": "bert-multilingual-v3.2",
    "processingTime": 145
  }
}
```

### Response (Fallback)
```json
{
  "success": true,
  "result": [
    {
      "location": "Dubai",
      "type": "city",
      "confidence": 0.5
    }
  ],
  "confidence": 0.5,
  "source": "rule-based",
  "metadata": {
    "fallbackReason": "model_timeout"
  }
}
```

### Frontend Integration
```typescript
// Web/React
const { suggestions, loading } = useSmartRoutes();
suggestions.getSuggestions(inputValue, userLocation);

// iOS/Swift
AIService.shared.getRouteSuggestions(query: "dub") { result in
    switch result {
    case .success(let suggestions):
        updateUI(with: suggestions)
    case .failure(let error):
        handleError(error)
    }
}

// Android/Kotlin
aiViewModel.getRouteSuggestions("dub").observe(this) { response ->
    when (response.source) {
        AISource.AI -> updateUIWithHighConfidence(response.data)
        AISource.RULE_BASED -> updateUIWithFallback(response.data)
    }
}
```

---

## 2. Dynamic Pricing

### Endpoint
```
POST /pricing/optimize
```

### Request
```json
{
  "feature": "dynamic_pricing",
  "input": {
    "from": "Dubai",
    "to": "Abu Dhabi",
    "distance_km": 140,
    "departureTime": "2026-01-05T14:00:00Z",
    "seats": 3,
    "tripType": "passenger",
    "userReputation": 4.5,
    "timestamp": "2026-01-01T10:00:00Z"
  },
  "context": {
    "userId": "user_123",
    "language": "en"
  },
  "options": {
    "timeout": 3000,
    "fallback": true
  }
}
```

### Response (Success)
```json
{
  "success": true,
  "result": {
    "price": 165,
    "currency": "AED",
    "breakdown": {
      "basePrice": 100,
      "distanceCharge": 45,
      "demandSurge": 20,
      "reputationDiscount": 0
    },
    "priceRange": {
      "min": 155,
      "max": 175
    },
    "factors": [
      "high_demand_weekend",
      "popular_route",
      "peak_hours"
    ]
  },
  "confidence": 0.87,
  "source": "ai",
  "metadata": {
    "modelVersion": "xgboost-pricing-v2.1",
    "processingTime": 234
  }
}
```

### Frontend Integration
```typescript
// Web/React
const { pricing, calculatePrice } = useDynamicPricing();
const aiPrice = await calculatePrice(tripData);
const displayPrice = aiPrice?.price || fallbackPrice;

// iOS/Swift
let pricingRequest = PricingRequest(
    from: "Dubai",
    to: "Abu Dhabi",
    distanceKm: 140,
    seats: 3
)
AIService.shared.calculateDynamicPrice(pricingRequest) { price in
    self.displayPrice = price?.optimizedPrice ?? self.fallbackPrice
}

// Android/Kotlin
aiViewModel.calculatePrice(tripData).observe(this) { response ->
    val displayPrice = if (response.confidence > 0.8) {
        response.data.price
    } else {
        calculateFallbackPrice(tripData)
    }
}
```

---

## 3. Risk Assessment

### Endpoint
```
POST /risk/assess
```

### Request
```json
{
  "feature": "risk_assessment",
  "input": {
    "action": "booking",
    "data": {
      "tripId": "trip_789",
      "amount": 165,
      "paymentMethod": "wallet"
    },
    "accountAge": 45,
    "previousFlags": 0
  },
  "context": {
    "userId": "user_123",
    "timestamp": "2026-01-01T10:00:00Z",
    "deviceType": "web"
  },
  "options": {
    "timeout": 2000,
    "fallback": true
  }
}
```

### Response
```json
{
  "success": true,
  "result": {
    "riskScore": 0.15,
    "riskLevel": "low",
    "flags": [],
    "recommendation": "allow",
    "additionalVerification": null,
    "factors": [
      "established_account",
      "good_reputation",
      "normal_transaction_pattern"
    ]
  },
  "confidence": 0.92,
  "source": "ai",
  "metadata": {
    "modelVersion": "random-forest-risk-v3.0",
    "processingTime": 123
  }
}
```

### Risk Levels
- **low** (0.0 - 0.3): Allow transaction
- **medium** (0.3 - 0.7): Allow with monitoring
- **high** (0.7 - 0.9): Require additional verification
- **critical** (0.9 - 1.0): Block transaction

### Frontend Integration
```typescript
// Web/React
const { assessRisk } = useRiskAssessment();
const riskResult = await assessRisk('booking', bookingData);
if (riskResult.riskScore > 0.7) {
    showVerificationDialog();
} else {
    proceedWithBooking();
}

// iOS/Swift
AIService.shared.assessRisk(action: .booking, data: bookingData) { result in
    guard result.riskScore < 0.7 else {
        self.showVerificationRequired()
        return
    }
    self.proceedWithBooking()
}

// Android/Kotlin
aiViewModel.assessRisk(RiskAction.BOOKING, bookingData).observe(this) { risk ->
    when (risk.riskLevel) {
        RiskLevel.LOW, RiskLevel.MEDIUM -> proceedWithBooking()
        RiskLevel.HIGH -> showVerificationDialog()
        RiskLevel.CRITICAL -> blockTransaction()
    }
}
```

---

## 4. Natural Language Search

### Endpoint
```
POST /nlp/parse
```

### Request
```json
{
  "feature": "nlp_search",
  "input": {
    "query": "I need a ride from Dubai to Abu Dhabi tomorrow morning for 2 people",
    "language": "en"
  },
  "context": {
    "language": "en",
    "timestamp": "2026-01-01T10:00:00Z"
  },
  "options": {
    "timeout": 2000,
    "fallback": true
  }
}
```

### Response
```json
{
  "success": true,
  "result": {
    "from": "Dubai",
    "to": "Abu Dhabi",
    "date": "2026-01-02",
    "time": "morning",
    "timeRange": {
      "start": "06:00",
      "end": "12:00"
    },
    "seats": 2,
    "preferences": null,
    "entities": {
      "locations": ["Dubai", "Abu Dhabi"],
      "dateTime": ["tomorrow", "morning"],
      "numbers": [2]
    }
  },
  "confidence": 0.94,
  "source": "ai",
  "metadata": {
    "modelVersion": "bert-multilingual-ner-v2.5",
    "processingTime": 187
  }
}
```

### Arabic Support
```json
{
  "input": {
    "query": "أريد رحلة من دبي إلى أبو ظبي غداً الصباح لشخصين",
    "language": "ar"
  }
}
```

### Frontend Integration
```typescript
// Web/React
const { parseQuery } = useNLPSearch();
const parsed = await parseQuery(searchText);
if (parsed) {
    setSearchForm({
        from: parsed.from,
        to: parsed.to,
        date: parsed.date,
        seats: parsed.seats
    });
}

// iOS/Swift
AIService.shared.parseNaturalLanguage(query: searchText, language: .english) { result in
    if let parsed = result.data {
        self.populateSearchForm(with: parsed)
    }
}

// Android/Kotlin
aiViewModel.parseNLQuery(searchText, Language.EN).observe(this) { result ->
    result.data?.let { parsed ->
        searchViewModel.updateFrom(parsed.from)
        searchViewModel.updateTo(parsed.to)
        searchViewModel.updateDate(parsed.date)
    }
}
```

---

## 5. Personalized Recommendations

### Endpoint
```
POST /recommendations/personalized
```

### Request
```json
{
  "feature": "recommendations",
  "input": {
    "currentLocation": {
      "lat": 25.2048,
      "lng": 55.2708
    },
    "timeOfDay": "morning"
  },
  "context": {
    "userId": "user_123",
    "timestamp": "2026-01-01T10:00:00Z"
  },
  "options": {
    "timeout": 3000,
    "fallback": true
  }
}
```

### Response
```json
{
  "success": true,
  "result": [
    {
      "tripId": "trip_456",
      "route": "Dubai → Abu Dhabi",
      "departureTime": "2026-01-02T08:00:00Z",
      "price": 165,
      "reason": "Frequently traveled route",
      "score": 0.92,
      "tags": ["frequent", "similar_users", "good_price"]
    },
    {
      "route": "Dubai → Sharjah",
      "reason": "Popular among users like you",
      "score": 0.85,
      "tags": ["collaborative_filtering", "nearby"]
    },
    {
      "route": "Dubai Marina → Business Bay",
      "reason": "Based on your location",
      "score": 0.78,
      "tags": ["location_based", "morning_commute"]
    }
  ],
  "confidence": 0.89,
  "source": "ai",
  "metadata": {
    "modelVersion": "collaborative-filter-v2.3",
    "processingTime": 456
  }
}
```

### Frontend Integration
```typescript
// Web/React
const { recommendations, loading } = usePersonalizedRecommendations();

// Display on dashboard
<RecommendedTrips recommendations={recommendations} />

// iOS/Swift
AIService.shared.getRecommendations { recommendations in
    self.dashboardView.showRecommendations(recommendations)
}

// Android/Kotlin
aiViewModel.getRecommendations().observe(this) { recs ->
    recommendationsAdapter.submitList(recs.data)
}
```

---

## 6. Predictive Analytics

### Endpoint
```
POST /analytics/predict
```

### Request
```json
{
  "feature": "predictive_analytics",
  "input": {
    "type": "demand",
    "route": {
      "from": "Dubai",
      "to": "Abu Dhabi"
    },
    "targetDate": "2026-01-05T00:00:00Z"
  },
  "context": {
    "timestamp": "2026-01-01T10:00:00Z"
  },
  "options": {
    "timeout": 4000,
    "fallback": true
  }
}
```

### Response
```json
{
  "success": true,
  "result": {
    "prediction": "high",
    "demandLevel": 8.5,
    "confidence": 0.84,
    "factors": [
      "weekend",
      "public_holiday",
      "historical_trend",
      "event_in_destination"
    ],
    "recommendations": {
      "bestTimeToBook": "2026-01-02T10:00:00Z",
      "expectedPriceRange": {
        "min": 150,
        "max": 200
      },
      "alternativeDates": [
        {
          "date": "2026-01-04T00:00:00Z",
          "demand": "medium",
          "savings": 15
        }
      ]
    }
  },
  "confidence": 0.84,
  "source": "ai",
  "metadata": {
    "modelVersion": "lstm-forecast-v1.8",
    "processingTime": 678
  }
}
```

### Prediction Types
- **demand**: Expected demand level (low/medium/high)
- **pricing**: Price trend forecast
- **optimal_time**: Best time to book or travel

### Frontend Integration
```typescript
// Web/React
const { insights, getInsights } = usePredictiveInsights();
const demandForecast = await getInsights('demand', route, targetDate);

// Display insight badge
{demandForecast?.prediction === 'high' && (
    <Badge variant="warning">High demand expected - Book early!</Badge>
)}

// iOS/Swift
AIService.shared.getDemandForecast(route: route, date: date) { forecast in
    if forecast.prediction == .high {
        self.showHighDemandAlert()
    }
}

// Android/Kotlin
aiViewModel.predictDemand(route, date).observe(this) { prediction ->
    if (prediction.data.demandLevel > 7.0) {
        showBookEarlyBadge()
    }
}
```

---

## 7. Smart Matching

### Endpoint
```
POST /matching/smart
```

### Request
```json
{
  "feature": "smart_matching",
  "input": {
    "from": "Dubai",
    "to": "Abu Dhabi",
    "date": "2026-01-05",
    "seats": 2,
    "preferences": {
      "noSmoking": true,
      "quietRide": true,
      "petsAllowed": false
    }
  },
  "context": {
    "userId": "user_123",
    "timestamp": "2026-01-01T10:00:00Z"
  },
  "options": {
    "timeout": 3000,
    "fallback": true
  }
}
```

### Response
```json
{
  "success": true,
  "result": [
    {
      "tripId": "trip_789",
      "matchScore": 0.94,
      "reasons": [
        "preference_match",
        "compatible_personality",
        "similar_values",
        "good_driver_rating"
      ],
      "compatibility": {
        "preferences": 1.0,
        "personality": 0.88,
        "reliability": 0.95
      },
      "driver": {
        "name": "Ahmed",
        "rating": 4.8,
        "trips": 245,
        "verified": true
      }
    }
  ],
  "confidence": 0.91,
  "source": "ai",
  "metadata": {
    "modelVersion": "gnn-matching-v1.5",
    "processingTime": 523
  }
}
```

### Frontend Integration
```typescript
// Web/React
const { matches, findMatches } = useSmartMatching();
const smartResults = await findMatches(searchCriteria);

// Merge AI matches with standard search
const allResults = [...smartResults, ...standardResults]
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

// iOS/Swift
AIService.shared.findSmartMatches(criteria) { aiMatches in
    let combined = self.mergeWithStandardSearch(aiMatches)
    self.displayResults(combined)
}

// Android/Kotlin
aiViewModel.findSmartMatches(criteria).observe(this) { aiResponse ->
    val combined = mergeResults(aiResponse.data, standardResults)
    resultsAdapter.submitList(combined)
}
```

---

## 8. Conversation AI

### Endpoint
```
POST /conversation/suggest
```

### Request
```json
{
  "feature": "conversation_ai",
  "input": {
    "history": [
      {
        "sender": "driver",
        "message": "I'll be at the pickup point in 5 minutes",
        "timestamp": "2026-01-01T10:00:00Z"
      }
    ],
    "tripId": "trip_789"
  },
  "context": {
    "language": "en",
    "timestamp": "2026-01-01T10:01:00Z"
  },
  "options": {
    "timeout": 2000,
    "fallback": true
  }
}
```

### Response
```json
{
  "success": true,
  "result": {
    "suggestions": [
      "Great, I'll be ready!",
      "Thank you for the update",
      "See you soon!"
    ],
    "sentiment": "positive",
    "tone": "professional",
    "translation": null
  },
  "confidence": 0.88,
  "source": "ai",
  "metadata": {
    "modelVersion": "gpt-4-turbo",
    "processingTime": 342
  }
}
```

### Frontend Integration
```typescript
// Web/React
const { suggestions, getSuggestions } = useConversationAI();
const replySuggestions = await getSuggestions(messageHistory, tripId);

// Display quick reply chips
<QuickReplyChips suggestions={replySuggestions} onSelect={sendMessage} />

// iOS/Swift
AIService.shared.getConversationSuggestions(history: messages) { suggestions in
    self.quickReplyView.update(with: suggestions)
}

// Android/Kotlin
aiViewModel.getQuickReplies(messages, tripId).observe(this) { suggestions ->
    quickReplyAdapter.submitList(suggestions.data.suggestions)
}
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Model timeout",
  "source": "rule-based",
  "latency": 5001,
  "metadata": {
    "fallbackReason": "timeout",
    "errorCode": "AI_TIMEOUT"
  }
}
```

### Error Codes
- `AI_TIMEOUT`: Request exceeded timeout threshold
- `AI_UNAVAILABLE`: AI service is down
- `MODEL_ERROR`: Model inference failed
- `INVALID_INPUT`: Input validation failed
- `RATE_LIMIT`: Too many requests
- `AUTH_REQUIRED`: Missing or invalid authentication

### Fallback Strategy
1. **Immediate Fallback**: Use rule-based logic instantly
2. **Cached Response**: Return previously cached AI response
3. **Degraded Service**: Continue with reduced AI features
4. **User Notification**: Inform user of limited AI (optional)

---

## Rate Limiting

```
Rate Limits per User:
- Smart Routes: 60 requests/minute
- Dynamic Pricing: 30 requests/minute
- Risk Assessment: 100 requests/hour
- NLP Search: 30 requests/minute
- Recommendations: 10 requests/hour
- Predictive: 20 requests/hour
- Smart Matching: 30 requests/minute
- Conversation AI: 60 requests/minute
```

### Rate Limit Response
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "metadata": {
    "errorCode": "RATE_LIMIT",
    "retryAfter": 60,
    "limit": 60,
    "remaining": 0,
    "resetAt": "2026-01-01T10:02:00Z"
  }
}
```

---

## Caching Strategy

### Client-Side Caching
- Route suggestions: 5 minutes
- Pricing: 2 minutes
- Recommendations: 30 minutes
- Predictive insights: 1 hour

### Cache Headers
```
Cache-Control: max-age=300
ETag: "ai-response-hash-123"
```

---

## Monitoring & Analytics

### Performance Metrics
- Latency per endpoint
- Confidence score distribution
- Fallback rate
- Cache hit rate
- User satisfaction (implicit)

### Logging
All AI requests are logged for:
- Model improvement
- Performance monitoring
- Debugging
- Compliance

### Privacy
- User consent required for AI features
- Data anonymization for model training
- GDPR/CCPA compliance
- Right to opt-out

---

## Version Control

Current API Version: **v1**

Breaking changes will increment version number.
Backward compatibility maintained for 6 months.

---

## Support

For AI API issues:
- Web: Check browser console for detailed errors
- iOS: Enable AI debug logging in settings
- Android: Check Logcat with tag "WasselAI"

Backend Team Contact: ai-team@wassel.app
