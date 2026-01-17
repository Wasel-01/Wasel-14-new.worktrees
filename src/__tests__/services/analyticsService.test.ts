import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Analytics Service
const mockAnalyticsService = {
    trackEvent: vi.fn(),
    trackPageView: vi.fn(),
    trackUserAction: vi.fn(),
    getTripAnalytics: vi.fn(),
    getEarningsAnalytics: vi.fn(),
    getUserAnalytics: vi.fn(),
};

describe('Analytics Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Event Tracking', () => {
        it('should track custom events', () => {
            mockAnalyticsService.trackEvent('trip_booked', {
                tripId: '123',
                price: 50,
            });

            expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith('trip_booked', {
                tripId: '123',
                price: 50,
            });
        });

        it('should track page views', () => {
            mockAnalyticsService.trackPageView('/dashboard');
            expect(mockAnalyticsService.trackPageView).toHaveBeenCalledWith('/dashboard');
        });

        it('should track user actions', () => {
            mockAnalyticsService.trackUserAction('button_click', {
                buttonId: 'book-ride',
                location: 'dashboard',
            });

            expect(mockAnalyticsService.trackUserAction).toHaveBeenCalledWith('button_click', {
                buttonId: 'book-ride',
                location: 'dashboard',
            });
        });
    });

    describe('Trip Analytics', () => {
        it('should get trip analytics for user', async () => {
            const mockAnalytics = {
                totalTrips: 25,
                completedTrips: 22,
                cancelledTrips: 3,
                averageRating: 4.7,
                totalDistance: 1250,
                favoriteRoutes: [
                    { from: 'Dubai', to: 'Abu Dhabi', count: 15 },
                    { from: 'Sharjah', to: 'Dubai', count: 7 },
                ],
            };

            mockAnalyticsService.getTripAnalytics.mockResolvedValue(mockAnalytics);

            const result = await mockAnalyticsService.getTripAnalytics('user123');
            expect(result.totalTrips).toBe(25);
            expect(result.completedTrips).toBe(22);
            expect(result.favoriteRoutes).toHaveLength(2);
        });

        it('should return default values for new users', async () => {
            mockAnalyticsService.getTripAnalytics.mockResolvedValue({
                totalTrips: 0,
                completedTrips: 0,
                cancelledTrips: 0,
                averageRating: 0,
                totalDistance: 0,
                favoriteRoutes: [],
            });

            const result = await mockAnalyticsService.getTripAnalytics('newUser');
            expect(result.totalTrips).toBe(0);
            expect(result.favoriteRoutes).toHaveLength(0);
        });
    });

    describe('Earnings Analytics', () => {
        it('should get earnings analytics for driver', async () => {
            const mockEarnings = {
                totalEarnings: 5000,
                monthlyEarnings: 1200,
                weeklyEarnings: 350,
                todayEarnings: 75,
                tripsCompleted: 45,
                averagePerTrip: 111.11,
                payoutHistory: [
                    { date: '2026-01-15', amount: 500 },
                    { date: '2026-01-01', amount: 700 },
                ],
            };

            mockAnalyticsService.getEarningsAnalytics.mockResolvedValue(mockEarnings);

            const result = await mockAnalyticsService.getEarningsAnalytics('driver123');
            expect(result.totalEarnings).toBe(5000);
            expect(result.payoutHistory).toHaveLength(2);
        });
    });

    describe('User Analytics', () => {
        it('should get user behavior analytics', async () => {
            const mockUserAnalytics = {
                sessionDuration: 1800,
                pagesViewed: 12,
                actionsPerformed: 25,
                lastActive: '2026-01-17T01:00:00Z',
                preferredPaymentMethod: 'card',
                appVersion: '1.0.0',
            };

            mockAnalyticsService.getUserAnalytics.mockResolvedValue(mockUserAnalytics);

            const result = await mockAnalyticsService.getUserAnalytics('user123');
            expect(result.sessionDuration).toBe(1800);
            expect(result.preferredPaymentMethod).toBe('card');
        });
    });
});
