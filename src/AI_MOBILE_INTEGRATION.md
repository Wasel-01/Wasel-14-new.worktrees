# Wassel AI - Mobile Integration Guide

## Overview
This guide provides complete integration instructions for iOS (Swift/SwiftUI) and Android (Kotlin/Jetpack Compose) developers to wire AI features into the Wassel mobile apps.

---

## iOS Integration (Swift/SwiftUI)

### 1. AI Service Layer

Create `AIService.swift`:

```swift
import Foundation
import Combine

// MARK: - AI Configuration

struct AIConfig: Codable {
    var enabled: Bool
    var features: AIFeatures
    var models: AIModels
    var thresholds: AIThresholds
    
    struct AIFeatures: Codable {
        var smartRoutes: Bool
        var dynamicPricing: Bool
        var riskAssessment: Bool
        var nlpSearch: Bool
        var recommendations: Bool
        var predictive: Bool
        var smartMatching: Bool
        var conversationAI: Bool
    }
    
    struct AIModels: Codable {
        var routeOptimization: String
        var pricingModel: String
        var riskModel: String
        var nlpModel: String
        var recommendationModel: String
    }
    
    struct AIThresholds: Codable {
        var riskScore: Double
        var matchConfidence: Double
        var pricingConfidence: Double
    }
}

// MARK: - AI Request/Response Models

struct AIRequest<T: Encodable>: Encodable {
    let feature: String
    let input: T
    let context: AIContext?
    let options: AIOptions?
    
    struct AIContext: Encodable {
        let userId: String?
        let sessionId: String?
        let language: String?
        let timestamp: String?
        let deviceType: String = "ios"
    }
    
    struct AIOptions: Encodable {
        let timeout: Int?
        let fallback: Bool?
        let cacheEnabled: Bool?
    }
}

struct AIResponse<T: Decodable>: Decodable {
    let success: Bool
    let data: T?
    let confidence: Double?
    let source: AISource
    let latency: Int
    let metadata: AIMetadata?
    let error: String?
    
    enum AISource: String, Decodable {
        case ai
        case ruleBased = "rule-based"
        case cached
    }
    
    struct AIMetadata: Decodable {
        let modelVersion: String?
        let processingTime: Int?
        let fallbackReason: String?
    }
}

// MARK: - AI Service

class AIService: ObservableObject {
    static let shared = AIService()
    
    private let baseURL = "https://ai.wassel.app/v1"
    private let session: URLSession
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()
    
    @Published var config: AIConfig?
    @Published var isEnabled: Bool = true
    
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        let configuration = URLSessionConfiguration.default
        configuration.timeoutIntervalForRequest = 5.0
        self.session = URLSession(configuration: configuration)
        
        loadConfig()
    }
    
    // MARK: - Configuration
    
    func loadConfig() {
        // Load from UserDefaults or fetch from backend
        if let data = UserDefaults.standard.data(forKey: "ai_config"),
           let config = try? decoder.decode(AIConfig.self, from: data) {
            self.config = config
            self.isEnabled = config.enabled
        }
    }
    
    // MARK: - Generic AI Request
    
    private func makeRequest<Input: Encodable, Output: Decodable>(
        endpoint: String,
        feature: String,
        input: Input,
        timeout: TimeInterval = 5.0
    ) async throws -> AIResponse<Output> {
        
        guard let userId = AuthService.shared.currentUser?.id else {
            throw AIError.notAuthenticated
        }
        
        let url = URL(string: "\(baseURL)\(endpoint)")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(AuthService.shared.token ?? "")", forHTTPHeaderField: "Authorization")
        request.setValue(userId, forHTTPHeaderField: "X-User-ID")
        request.setValue(Locale.current.languageCode ?? "en", forHTTPHeaderField: "X-Language")
        request.setValue("ios", forHTTPHeaderField: "X-Device-Type")
        
        let aiRequest = AIRequest(
            feature: feature,
            input: input,
            context: AIRequest.AIContext(
                userId: userId,
                sessionId: UUID().uuidString,
                language: Locale.current.languageCode,
                timestamp: ISO8601DateFormatter().string(from: Date())
            ),
            options: AIRequest.AIOptions(
                timeout: Int(timeout * 1000),
                fallback: true,
                cacheEnabled: true
            )
        )
        
        request.httpBody = try encoder.encode(aiRequest)
        request.timeoutInterval = timeout
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw AIError.invalidResponse
        }
        
        guard httpResponse.statusCode == 200 else {
            throw AIError.serverError(httpResponse.statusCode)
        }
        
        let aiResponse = try decoder.decode(AIResponse<Output>.self, from: data)
        
        // Log AI interaction
        logAIInteraction(feature: feature, response: aiResponse)
        
        return aiResponse
    }
    
    // MARK: - Smart Route Suggestions
    
    func getRouteSuggestions(
        query: String,
        userLocation: CLLocationCoordinate2D? = nil
    ) async throws -> AIResponse<[RoutesuggestionLite]> {
        
        struct Input: Encodable {
            let query: String
            let userLocation: Location?
            
            struct Location: Encodable {
                let lat: Double
                let lng: Double
            }
        }
        
        let input = Input(
            query: query,
            userLocation: userLocation.map { Input.Location(lat: $0.latitude, lng: $0.longitude) }
        )
        
        return try await makeRequest(
            endpoint: "/routes/suggest",
            feature: "smart_routes",
            input: input,
            timeout: 2.0
        )
    }
    
    // MARK: - Dynamic Pricing
    
    func calculateDynamicPrice(
        from: String,
        to: String,
        distanceKm: Double,
        departureTime: Date,
        seats: Int,
        tripType: TripType
    ) async throws -> AIResponse<PricingResult> {
        
        struct Input: Encodable {
            let from: String
            let to: String
            let distance_km: Double
            let departureTime: String
            let seats: Int
            let tripType: String
        }
        
        let input = Input(
            from: from,
            to: to,
            distance_km: distanceKm,
            departureTime: ISO8601DateFormatter().string(from: departureTime),
            seats: seats,
            tripType: tripType.rawValue
        )
        
        return try await makeRequest(
            endpoint: "/pricing/optimize",
            feature: "dynamic_pricing",
            input: input,
            timeout: 3.0
        )
    }
    
    // MARK: - Risk Assessment
    
    func assessRisk(
        action: RiskAction,
        data: [String: Any]
    ) async throws -> AIResponse<RiskResult> {
        
        struct Input: Encodable {
            let action: String
            let data: [String: String] // Simplified for example
        }
        
        let input = Input(
            action: action.rawValue,
            data: data.mapValues { "\($0)" }
        )
        
        return try await makeRequest(
            endpoint: "/risk/assess",
            feature: "risk_assessment",
            input: input,
            timeout: 2.0
        )
    }
    
    // MARK: - NLP Search
    
    func parseNaturalLanguage(
        query: String,
        language: Language
    ) async throws -> AIResponse<ParsedQuery> {
        
        struct Input: Encodable {
            let query: String
            let language: String
        }
        
        let input = Input(query: query, language: language.rawValue)
        
        return try await makeRequest(
            endpoint: "/nlp/parse",
            feature: "nlp_search",
            input: input,
            timeout: 2.0
        )
    }
    
    // MARK: - Personalized Recommendations
    
    func getRecommendations(
        currentLocation: CLLocationCoordinate2D? = nil,
        timeOfDay: String? = nil
    ) async throws -> AIResponse<[Recommendation]> {
        
        struct Input: Encodable {
            let currentLocation: Location?
            let timeOfDay: String?
            
            struct Location: Encodable {
                let lat: Double
                let lng: Double
            }
        }
        
        let input = Input(
            currentLocation: currentLocation.map { Input.Location(lat: $0.latitude, lng: $0.longitude) },
            timeOfDay: timeOfDay
        )
        
        return try await makeRequest(
            endpoint: "/recommendations/personalized",
            feature: "recommendations",
            input: input,
            timeout: 3.0
        )
    }
    
    // MARK: - Predictive Insights
    
    func predictDemand(
        route: Route,
        targetDate: Date
    ) async throws -> AIResponse<PredictiveInsight> {
        
        struct Input: Encodable {
            let type: String = "demand"
            let route: RouteInput
            let targetDate: String
            
            struct RouteInput: Encodable {
                let from: String
                let to: String
            }
        }
        
        let input = Input(
            route: Input.RouteInput(from: route.from, to: route.to),
            targetDate: ISO8601DateFormatter().string(from: targetDate)
        )
        
        return try await makeRequest(
            endpoint: "/analytics/predict",
            feature: "predictive_analytics",
            input: input,
            timeout: 4.0
        )
    }
    
    // MARK: - Smart Matching
    
    func findSmartMatches(
        searchCriteria: SearchCriteria
    ) async throws -> AIResponse<[SmartMatch]> {
        
        return try await makeRequest(
            endpoint: "/matching/smart",
            feature: "smart_matching",
            input: searchCriteria,
            timeout: 3.0
        )
    }
    
    // MARK: - Conversation AI
    
    func getConversationSuggestions(
        history: [Message],
        tripId: String? = nil
    ) async throws -> AIResponse<ConversationSuggestions> {
        
        struct Input: Encodable {
            let history: [MessageInput]
            let tripId: String?
            
            struct MessageInput: Encodable {
                let sender: String
                let message: String
                let timestamp: String
            }
        }
        
        let input = Input(
            history: history.map { msg in
                Input.MessageInput(
                    sender: msg.senderId,
                    message: msg.content,
                    timestamp: ISO8601DateFormatter().string(from: msg.timestamp)
                )
            },
            tripId: tripId
        )
        
        return try await makeRequest(
            endpoint: "/conversation/suggest",
            feature: "conversation_ai",
            input: input,
            timeout: 2.0
        )
    }
    
    // MARK: - Logging
    
    private func logAIInteraction<T>(feature: String, response: AIResponse<T>) {
        // Send to analytics
        AnalyticsService.shared.track(event: "ai_interaction", properties: [
            "feature": feature,
            "source": response.source.rawValue,
            "confidence": response.confidence ?? 0,
            "latency": response.latency,
            "success": response.success
        ])
    }
}

// MARK: - Supporting Types

enum AIError: Error {
    case notAuthenticated
    case invalidResponse
    case serverError(Int)
    case timeout
    case modelError
}

enum TripType: String, Codable {
    case passenger
    case package
}

enum RiskAction: String {
    case signup
    case booking
    case profileUpdate = "profile_update"
    case payment
}

enum Language: String {
    case english = "en"
    case arabic = "ar"
}

struct RouteSuggestion: Decodable {
    let location: String
    let type: String
    let confidence: Double
}

struct PricingResult: Decodable {
    let price: Double
    let currency: String
    let breakdown: PriceBreakdown
    
    struct PriceBreakdown: Decodable {
        let basePrice: Double?
        let distanceCharge: Double?
        let demandSurge: Double?
    }
}

struct RiskResult: Decodable {
    let riskScore: Double
    let flags: [String]
    let recommendation: String
}

struct ParsedQuery: Decodable {
    let from: String?
    let to: String?
    let date: String?
    let seats: Int?
    let preferences: [String: Bool]?
}

struct Recommendation: Decodable {
    let tripId: String?
    let route: String
    let reason: String
    let score: Double
}

struct PredictiveInsight: Decodable {
    let prediction: String
    let confidence: Double
    let factors: [String]
}

struct SmartMatch: Decodable {
    let tripId: String
    let matchScore: Double
    let reasons: [String]
}

struct ConversationSuggestions: Decodable {
    let suggestions: [String]
    let sentiment: String?
    let translation: String?
}

struct Route {
    let from: String
    let to: String
}

struct SearchCriteria: Encodable {
    let from: String
    let to: String
    let date: String
    let seats: Int
    let preferences: [String: Bool]?
}

struct Message {
    let senderId: String
    let content: String
    let timestamp: Date
}
```

### 2. SwiftUI ViewModels

Create `AIFeaturesViewModel.swift`:

```swift
import SwiftUI
import Combine

@MainActor
class SearchViewModel: ObservableObject {
    @Published var fromText: String = ""
    @Published var toText: String = ""
    @Published var routeSuggestions: [RouteSuggestion] = []
    @Published var isLoadingSuggestions = false
    
    private let aiService = AIService.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        // Debounce route suggestions
        $fromText
            .debounce(for: .milliseconds(300), scheduler: DispatchQueue.main)
            .sink { [weak self] query in
                Task {
                    await self?.loadRouteSuggestions(for: query)
                }
            }
            .store(in: &cancellables)
    }
    
    func loadRouteSuggestions(for query: String) async {
        guard query.count >= 2 else {
            routeSuggestions = []
            return
        }
        
        isLoadingSuggestions = true
        defer { isLoadingSuggestions = false }
        
        do {
            let response = try await aiService.getRouteSuggestions(query: query)
            if response.success, let suggestions = response.data {
                self.routeSuggestions = suggestions
            }
        } catch {
            print("Route suggestions error: \(error)")
            // Fallback to standard search
        }
    }
    
    func parseNaturalLanguageSearch(_ query: String) async {
        do {
            let response = try await aiService.parseNaturalLanguage(
                query: query,
                language: .english
            )
            
            if response.success, let parsed = response.data {
                // Populate search form
                if let from = parsed.from { self.fromText = from }
                if let to = parsed.to { self.toText = to }
                // Update other fields as needed
            }
        } catch {
            print("NLP parse error: \(error)")
        }
    }
}

@MainActor
class PricingViewModel: ObservableObject {
    @Published var aiPrice: Double?
    @Published var aiConfidence: Double?
    @Published var isCalculating = false
    
    private let aiService = AIService.shared
    
    func calculatePrice(tripData: TripData) async {
        guard aiService.config?.features.dynamicPricing == true else {
            return
        }
        
        isCalculating = true
        defer { isCalculating = false }
        
        do {
            let response = try await aiService.calculateDynamicPrice(
                from: tripData.from,
                to: tripData.to,
                distanceKm: tripData.distanceKm,
                departureTime: tripData.departureTime,
                seats: tripData.seats,
                tripType: .passenger
            )
            
            if response.success, let pricing = response.data {
                self.aiPrice = pricing.price
                self.aiConfidence = response.confidence
            }
        } catch {
            print("Pricing error: \(error)")
        }
    }
}

struct TripData {
    let from: String
    let to: String
    let distanceKm: Double
    let departureTime: Date
    let seats: Int
}
```

### 3. SwiftUI Views Integration

```swift
struct FindRideView: View {
    @StateObject private var viewModel = SearchViewModel()
    @StateObject private var aiService = AIService.shared
    
    var body: some View {
        VStack {
            // Natural Language Search Bar
            if aiService.config?.features.nlpSearch == true {
                TextField("Try: 'Dubai to Abu Dhabi tomorrow morning'", text: $naturalSearchText)
                    .textFieldStyle(.roundedBorder)
                    .onSubmit {
                        Task {
                            await viewModel.parseNaturalLanguageSearch(naturalSearchText)
                        }
                    }
            }
            
            // Standard Search Fields with AI Suggestions
            VStack {
                TextField("From", text: $viewModel.fromText)
                    .textFieldStyle(.roundedBorder)
                
                if !viewModel.routeSuggestions.isEmpty {
                    ForEach(viewModel.routeSuggestions, id: \.location) { suggestion in
                        HStack {
                            Text(suggestion.location)
                            Spacer()
                            if suggestion.confidence > 0.8 {
                                Image(systemName: "sparkles")
                                    .foregroundColor(.blue)
                            }
                        }
                        .onTapGesture {
                            viewModel.fromText = suggestion.location
                            viewModel.routeSuggestions = []
                        }
                    }
                    .padding(.horizontal)
                }
            }
            
            // Rest of search form
        }
    }
}

struct TripCardView: View {
    let trip: Trip
    @StateObject private var pricingVM = PricingViewModel()
    
    var body: some View {
        VStack {
            // Trip details
            
            HStack {
                if let aiPrice = pricingVM.aiPrice,
                   let confidence = pricingVM.aiConfidence,
                   confidence > 0.8 {
                    VStack(alignment: .leading) {
                        Text("AED \(Int(aiPrice))")
                            .font(.title2)
                        Text("AI-optimized price")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                } else {
                    Text("AED \(trip.price)")
                        .font(.title2)
                }
            }
        }
        .task {
            await pricingVM.calculatePrice(tripData: trip.toTripData())
        }
    }
}
```

### 4. Error Handling & Fallbacks

```swift
extension AIService {
    func makeRequestWithFallback<Input: Encodable, Output: Decodable>(
        endpoint: String,
        feature: String,
        input: Input,
        fallback: @escaping () -> Output
    ) async -> Output {
        
        do {
            let response: AIResponse<Output> = try await makeRequest(
                endpoint: endpoint,
                feature: feature,
                input: input
            )
            
            if response.success, let data = response.data {
                return data
            } else {
                return fallback()
            }
        } catch {
            print("AI request failed, using fallback: \(error)")
            return fallback()
        }
    }
}
```

---

## Android Integration (Kotlin/Jetpack Compose)

### 1. AI Service Layer

Create `AIService.kt`:

```kotlin
package com.wassel.ai

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

// MARK: - Data Models

@Serializable
data class AIConfig(
    val enabled: Boolean,
    val features: AIFeatures,
    val models: AIModels,
    val thresholds: AIThresholds
) {
    @Serializable
    data class AIFeatures(
        val smartRoutes: Boolean,
        val dynamicPricing: Boolean,
        val riskAssessment: Boolean,
        val nlpSearch: Boolean,
        val recommendations: Boolean,
        val predictive: Boolean,
        val smartMatching: Boolean,
        val conversationAI: Boolean
    )
    
    @Serializable
    data class AIModels(
        val routeOptimization: String,
        val pricingModel: String,
        val riskModel: String,
        val nlpModel: String,
        val recommendationModel: String
    )
    
    @Serializable
    data class AIThresholds(
        val riskScore: Double,
        val matchConfidence: Double,
        val pricingConfidence: Double
    )
}

@Serializable
data class AIRequest<T>(
    val feature: String,
    val input: T,
    val context: AIContext? = null,
    val options: AIOptions? = null
) {
    @Serializable
    data class AIContext(
        val userId: String? = null,
        val sessionId: String? = null,
        val language: String? = null,
        val timestamp: String? = null,
        val deviceType: String = "android"
    )
    
    @Serializable
    data class AIOptions(
        val timeout: Int? = null,
        val fallback: Boolean? = null,
        val cacheEnabled: Boolean? = null
    )
}

@Serializable
data class AIResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val confidence: Double? = null,
    val source: AISource,
    val latency: Int,
    val metadata: AIMetadata? = null,
    val error: String? = null
) {
    enum class AISource {
        AI,
        RULE_BASED,
        CACHED
    }
    
    @Serializable
    data class AIMetadata(
        val modelVersion: String? = null,
        val processingTime: Int? = null,
        val fallbackReason: String? = null
    )
}

// MARK: - AI Service

class AIService private constructor() {
    companion object {
        val instance: AIService by lazy { AIService() }
        private const val BASE_URL = "https://ai.wassel.app/v1"
    }
    
    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }
    
    private val client = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(5, TimeUnit.SECONDS)
        .writeTimeout(5, TimeUnit.SECONDS)
        .build()
    
    var config: AIConfig? = null
        private set
    
    init {
        loadConfig()
    }
    
    private fun loadConfig() {
        // Load from SharedPreferences or fetch from backend
        // config = ...
    }
    
    // MARK: - Generic Request Handler
    
    private suspend inline fun <reified Input, reified Output> makeRequest(
        endpoint: String,
        feature: String,
        input: Input,
        timeoutMs: Long = 5000
    ): AIResponse<Output> = withContext(Dispatchers.IO) {
        
        val userId = AuthManager.instance.currentUserId
        val token = AuthManager.instance.currentToken
        
        val aiRequest = AIRequest(
            feature = feature,
            input = input,
            context = AIRequest.AIContext(
                userId = userId,
                sessionId = java.util.UUID.randomUUID().toString(),
                language = java.util.Locale.getDefault().language,
                timestamp = java.time.Instant.now().toString()
            ),
            options = AIRequest.AIOptions(
                timeout = timeoutMs.toInt(),
                fallback = true,
                cacheEnabled = true
            )
        )
        
        val requestBody = json.encodeToString(
            AIRequest.serializer(Input.serializer()),
            aiRequest
        ).toRequestBody("application/json".toMediaType())
        
        val request = Request.Builder()
            .url("$BASE_URL$endpoint")
            .post(requestBody)
            .addHeader("Authorization", "Bearer $token")
            .addHeader("X-User-ID", userId ?: "")
            .addHeader("X-Language", java.util.Locale.getDefault().language)
            .addHeader("X-Device-Type", "android")
            .build()
        
        try {
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: throw Exception("Empty response")
            
            val aiResponse = json.decodeFromString<AIResponse<Output>>(responseBody)
            
            // Log interaction
            logAIInteraction(feature, aiResponse)
            
            aiResponse
        } catch (e: Exception) {
            AIResponse(
                success = false,
                error = e.message,
                source = AIResponse.AISource.RULE_BASED,
                latency = 0
            )
        }
    }
    
    // MARK: - Smart Route Suggestions
    
    @Serializable
    data class RouteInput(
        val query: String,
        val userLocation: Location? = null
    ) {
        @Serializable
        data class Location(val lat: Double, val lng: Double)
    }
    
    @Serializable
    data class RouteSuggestion(
        val location: String,
        val type: String,
        val confidence: Double
    )
    
    suspend fun getRouteSuggestions(
        query: String,
        userLocation: Pair<Double, Double>? = null
    ): AIResponse<List<RouteSuggestion>> {
        val input = RouteInput(
            query = query,
            userLocation = userLocation?.let { RouteInput.Location(it.first, it.second) }
        )
        
        return makeRequest(
            endpoint = "/routes/suggest",
            feature = "smart_routes",
            input = input,
            timeoutMs = 2000
        )
    }
    
    // MARK: - Dynamic Pricing
    
    @Serializable
    data class PricingInput(
        val from: String,
        val to: String,
        val distance_km: Double,
        val departureTime: String,
        val seats: Int,
        val tripType: String
    )
    
    @Serializable
    data class PricingResult(
        val price: Double,
        val currency: String,
        val breakdown: PriceBreakdown
    ) {
        @Serializable
        data class PriceBreakdown(
            val basePrice: Double? = null,
            val distanceCharge: Double? = null,
            val demandSurge: Double? = null
        )
    }
    
    suspend fun calculateDynamicPrice(
        from: String,
        to: String,
        distanceKm: Double,
        departureTime: String,
        seats: Int,
        tripType: String = "passenger"
    ): AIResponse<PricingResult> {
        val input = PricingInput(
            from = from,
            to = to,
            distance_km = distanceKm,
            departureTime = departureTime,
            seats = seats,
            tripType = tripType
        )
        
        return makeRequest(
            endpoint = "/pricing/optimize",
            feature = "dynamic_pricing",
            input = input,
            timeoutMs = 3000
        )
    }
    
    // MARK: - Risk Assessment
    
    @Serializable
    data class RiskInput(
        val action: String,
        val data: Map<String, String>
    )
    
    @Serializable
    data class RiskResult(
        val riskScore: Double,
        val flags: List<String>,
        val recommendation: String
    )
    
    suspend fun assessRisk(
        action: String,
        data: Map<String, Any>
    ): AIResponse<RiskResult> {
        val input = RiskInput(
            action = action,
            data = data.mapValues { it.value.toString() }
        )
        
        return makeRequest(
            endpoint = "/risk/assess",
            feature = "risk_assessment",
            input = input,
            timeoutMs = 2000
        )
    }
    
    // MARK: - NLP Search
    
    @Serializable
    data class NLPInput(
        val query: String,
        val language: String
    )
    
    @Serializable
    data class ParsedQuery(
        val from: String? = null,
        val to: String? = null,
        val date: String? = null,
        val seats: Int? = null,
        val preferences: Map<String, Boolean>? = null
    )
    
    suspend fun parseNaturalLanguage(
        query: String,
        language: String = "en"
    ): AIResponse<ParsedQuery> {
        val input = NLPInput(query = query, language = language)
        
        return makeRequest(
            endpoint = "/nlp/parse",
            feature = "nlp_search",
            input = input,
            timeoutMs = 2000
        )
    }
    
    // MARK: - Personalized Recommendations
    
    @Serializable
    data class RecommendationInput(
        val currentLocation: Location? = null,
        val timeOfDay: String? = null
    ) {
        @Serializable
        data class Location(val lat: Double, val lng: Double)
    }
    
    @Serializable
    data class Recommendation(
        val tripId: String? = null,
        val route: String,
        val reason: String,
        val score: Double
    )
    
    suspend fun getRecommendations(
        currentLocation: Pair<Double, Double>? = null,
        timeOfDay: String? = null
    ): AIResponse<List<Recommendation>> {
        val input = RecommendationInput(
            currentLocation = currentLocation?.let { 
                RecommendationInput.Location(it.first, it.second) 
            },
            timeOfDay = timeOfDay
        )
        
        return makeRequest(
            endpoint = "/recommendations/personalized",
            feature = "recommendations",
            input = input,
            timeoutMs = 3000
        )
    }
    
    // MARK: - Logging
    
    private fun <T> logAIInteraction(feature: String, response: AIResponse<T>) {
        AnalyticsManager.instance.track("ai_interaction", mapOf(
            "feature" to feature,
            "source" to response.source.name,
            "confidence" to (response.confidence ?: 0.0),
            "latency" to response.latency,
            "success" to response.success
        ))
    }
}
```

### 2. Jetpack Compose ViewModels

Create `AIViewModels.kt`:

```kotlin
package com.wassel.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wassel.ai.AIService
import com.wassel.ai.RouteSuggestion
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

@OptIn(FlowPreview::class)
class SearchViewModel : ViewModel() {
    private val aiService = AIService.instance
    
    private val _fromText = MutableStateFlow("")
    val fromText: StateFlow<String> = _fromText.asStateFlow()
    
    private val _routeSuggestions = MutableStateFlow<List<RouteSuggestion>>(emptyList())
    val routeSuggestions: StateFlow<List<RouteSuggestion>> = _routeSuggestions.asStateFlow()
    
    private val _isLoadingSuggestions = MutableStateFlow(false)
    val isLoadingSuggestions: StateFlow<Boolean> = _isLoadingSuggestions.asStateFlow()
    
    init {
        // Debounce suggestions
        fromText
            .debounce(300)
            .onEach { query ->
                if (query.length >= 2) {
                    loadRouteSuggestions(query)
                } else {
                    _routeSuggestions.value = emptyList()
                }
            }
            .launchIn(viewModelScope)
    }
    
    fun updateFromText(text: String) {
        _fromText.value = text
    }
    
    private fun loadRouteSuggestions(query: String) {
        viewModelScope.launch {
            _isLoadingSuggestions.value = true
            try {
                val response = aiService.getRouteSuggestions(query)
                if (response.success && response.data != null) {
                    _routeSuggestions.value = response.data
                }
            } catch (e: Exception) {
                // Fallback to standard search
            } finally {
                _isLoadingSuggestions.value = false
            }
        }
    }
    
    fun parseNaturalLanguage(query: String) {
        viewModelScope.launch {
            try {
                val response = aiService.parseNaturalLanguage(query)
                if (response.success && response.data != null) {
                    val parsed = response.data
                    _fromText.value = parsed.from ?: ""
                    // Update other fields
                }
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}

class PricingViewModel : ViewModel() {
    private val aiService = AIService.instance
    
    private val _aiPrice = MutableStateFlow<Double?>(null)
    val aiPrice: StateFlow<Double?> = _aiPrice.asStateFlow()
    
    private val _aiConfidence = MutableStateFlow<Double?>(null)
    val aiConfidence: StateFlow<Double?> = _aiConfidence.asStateFlow()
    
    fun calculatePrice(tripData: TripData) {
        viewModelScope.launch {
            try {
                val response = aiService.calculateDynamicPrice(
                    from = tripData.from,
                    to = tripData.to,
                    distanceKm = tripData.distanceKm,
                    departureTime = tripData.departureTime,
                    seats = tripData.seats
                )
                
                if (response.success && response.data != null) {
                    _aiPrice.value = response.data.price
                    _aiConfidence.value = response.confidence
                }
            } catch (e: Exception) {
                // Fallback to standard pricing
            }
        }
    }
}

data class TripData(
    val from: String,
    val to: String,
    val distanceKm: Double,
    val departureTime: String,
    val seats: Int
)
```

### 3. Jetpack Compose UI Integration

```kotlin
package com.wassel.ui.screens

import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.wassel.viewmodels.SearchViewModel
import com.wassel.ai.AIService

@Composable
fun FindRideScreen(
    viewModel: SearchViewModel = viewModel()
) {
    val fromText by viewModel.fromText.collectAsState()
    val suggestions by viewModel.routeSuggestions.collectAsState()
    val isLoadingSuggestions by viewModel.isLoadingSuggestions.collectAsState()
    val aiConfig = AIService.instance.config
    
    Column {
        // Natural Language Search (if enabled)
        if (aiConfig?.features?.nlpSearch == true) {
            var nlQuery by remember { mutableStateOf("") }
            
            OutlinedTextField(
                value = nlQuery,
                onValueChange = { nlQuery = it },
                label = { Text("Try: 'Dubai to Abu Dhabi tomorrow'") },
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(
                    onSearch = {
                        viewModel.parseNaturalLanguage(nlQuery)
                    }
                ),
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        // From field with AI suggestions
        OutlinedTextField(
            value = fromText,
            onValueChange = { viewModel.updateFromText(it) },
            label = { Text("From") },
            modifier = Modifier.fillMaxWidth()
        )
        
        // AI Suggestions Dropdown
        if (suggestions.isNotEmpty()) {
            Card {
                LazyColumn {
                    items(suggestions) { suggestion ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    viewModel.updateFromText(suggestion.location)
                                }
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(suggestion.location)
                            if (suggestion.confidence > 0.8) {
                                Icon(
                                    imageVector = Icons.Default.AutoAwesome,
                                    contentDescription = "AI Suggestion",
                                    tint = Color.Blue
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun TripCard(
    trip: Trip,
    modifier: Modifier = Modifier
) {
    val pricingVM: PricingViewModel = viewModel()
    val aiPrice by pricingVM.aiPrice.collectAsState()
    val aiConfidence by pricingVM.aiConfidence.collectAsState()
    
    LaunchedEffect(trip.id) {
        pricingVM.calculatePrice(trip.toTripData())
    }
    
    Card(modifier = modifier) {
        Column {
            // Trip details
            
            Row {
                if (aiPrice != null && (aiConfidence ?: 0.0) > 0.8) {
                    Column {
                        Text(
                            text = "AED ${aiPrice?.toInt()}",
                            style = MaterialTheme.typography.h6
                        )
                        Text(
                            text = "AI-optimized price",
                            style = MaterialTheme.typography.caption,
                            color = MaterialTheme.colors.secondary
                        )
                    }
                } else {
                    Text(
                        text = "AED ${trip.price}",
                        style = MaterialTheme.typography.h6
                    )
                }
            }
        }
    }
}
```

---

## Testing AI Integration

### iOS Testing

```swift
// Unit Tests
class AIServiceTests: XCTestCase {
    func testRouteSuggestions() async throws {
        let service = AIService.shared
        let response = try await service.getRouteSuggestions(query: "dubai")
        
        XCTAssertTrue(response.success)
        XCTAssertNotNil(response.data)
        XCTAssertGreaterThan(response.data?.count ?? 0, 0)
    }
    
    func testFallbackOnTimeout() async throws {
        // Test with very short timeout
        // Should fallback to rule-based
    }
}
```

### Android Testing

```kotlin
// Unit Tests
class AIServiceTest {
    @Test
    fun `test route suggestions returns valid data`() = runTest {
        val service = AIService.instance
        val response = service.getRouteSuggestions("dubai")
        
        assertTrue(response.success)
        assertNotNull(response.data)
        assertTrue(response.data!!.isNotEmpty())
    }
    
    @Test
    fun `test fallback on error`() = runTest {
        // Mock network error
        // Verify fallback behavior
    }
}
```

---

## Performance Optimization

### Caching Strategy

#### iOS
```swift
class AICache {
    static let shared = AICache()
    private let cache = NSCache<NSString, CacheEntry>()
    
    func get<T>(key: String) -> T? {
        return cache.object(forKey: key as NSString)?.value as? T
    }
    
    func set<T>(key: String, value: T, ttl: TimeInterval = 300) {
        let entry = CacheEntry(value: value, expiresAt: Date().addingTimeInterval(ttl))
        cache.setObject(entry, forKey: key as NSString)
    }
}
```

#### Android
```kotlin
class AICache private constructor() {
    companion object {
        val instance: AICache by lazy { AICache() }
    }
    
    private val cache = LruCache<String, CacheEntry>(100)
    
    fun <T> get(key: String): T? {
        val entry = cache.get(key) ?: return null
        return if (entry.isExpired()) {
            cache.remove(key)
            null
        } else {
            entry.value as? T
        }
    }
    
    fun <T> set(key: String, value: T, ttlMs: Long = 300000) {
        cache.put(key, CacheEntry(value, System.currentTimeMillis() + ttlMs))
    }
}

data class CacheEntry(
    val value: Any,
    val expiresAt: Long
) {
    fun isExpired() = System.currentTimeMillis() > expiresAt
}
```

---

## Deployment Checklist

- [ ] AI backend endpoints are deployed
- [ ] API keys and tokens are configured
- [ ] Feature flags are set up
- [ ] Logging and analytics are integrated
- [ ] Error handling and fallbacks tested
- [ ] Performance benchmarks met
- [ ] User consent flows implemented
- [ ] Privacy policy updated
- [ ] App Store / Play Store compliance
- [ ] Beta testing completed

---

## Support & Resources

- **Backend API Docs**: `/AI_API_CONTRACTS.md`
- **AI Feature Map**: `/AI_INTERACTION_MAP.md`
- **Backend Team**: ai-team@wassel.app
- **Slack Channel**: #wassel-ai-integration
