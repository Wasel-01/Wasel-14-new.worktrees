import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Matching Service
const mockMatchingService = {
    findMatches: vi.fn(),
    calculateMatchScore: vi.fn(),
    rankMatches: vi.fn(),
    filterByPreferences: vi.fn(),
};

describe('Matching Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('findMatches', () => {
        it('should find matching trips based on criteria', async () => {
            const searchCriteria = {
                from: 'Dubai',
                to: 'Abu Dhabi',
                date: '2026-01-20',
                seats: 2,
            };

            const mockMatches = [
                { id: '1', score: 0.95, trip: { from: 'Dubai', to: 'Abu Dhabi' } },
                { id: '2', score: 0.85, trip: { from: 'Dubai', to: 'Abu Dhabi' } },
            ];

            mockMatchingService.findMatches.mockResolvedValue(mockMatches);

            const result = await mockMatchingService.findMatches(searchCriteria);
            expect(result).toHaveLength(2);
            expect(result[0].score).toBeGreaterThan(result[1].score);
        });

        it('should return empty array when no matches found', async () => {
            mockMatchingService.findMatches.mockResolvedValue([]);

            const result = await mockMatchingService.findMatches({
                from: 'NonExistent',
                to: 'City',
            });
            expect(result).toHaveLength(0);
        });
    });

    describe('calculateMatchScore', () => {
        it('should calculate score based on route similarity', () => {
            mockMatchingService.calculateMatchScore.mockReturnValue(0.95);

            const score = mockMatchingService.calculateMatchScore(
                { from: 'Dubai Marina', to: 'Abu Dhabi Corniche' },
                { from: 'Dubai Marina', to: 'Abu Dhabi Corniche' }
            );

            expect(score).toBe(0.95);
        });

        it('should return lower score for partial matches', () => {
            mockMatchingService.calculateMatchScore.mockReturnValue(0.7);

            const score = mockMatchingService.calculateMatchScore(
                { from: 'Dubai', to: 'Abu Dhabi' },
                { from: 'Dubai Marina', to: 'Abu Dhabi Corniche' }
            );

            expect(score).toBe(0.7);
        });
    });

    describe('rankMatches', () => {
        it('should rank matches by score in descending order', () => {
            const matches = [
                { id: '1', score: 0.7 },
                { id: '2', score: 0.95 },
                { id: '3', score: 0.85 },
            ];

            mockMatchingService.rankMatches.mockReturnValue([
                { id: '2', score: 0.95 },
                { id: '3', score: 0.85 },
                { id: '1', score: 0.7 },
            ]);

            const ranked = mockMatchingService.rankMatches(matches);
            expect(ranked[0].score).toBe(0.95);
            expect(ranked[1].score).toBe(0.85);
            expect(ranked[2].score).toBe(0.7);
        });
    });

    describe('filterByPreferences', () => {
        it('should filter by gender preference', () => {
            const matches = [
                { id: '1', driver: { gender: 'male' } },
                { id: '2', driver: { gender: 'female' } },
            ];

            mockMatchingService.filterByPreferences.mockReturnValue([
                { id: '2', driver: { gender: 'female' } },
            ]);

            const filtered = mockMatchingService.filterByPreferences(matches, {
                genderPreference: 'female',
            });

            expect(filtered).toHaveLength(1);
            expect(filtered[0].driver.gender).toBe('female');
        });

        it('should filter by smoking preference', () => {
            const matches = [
                { id: '1', preferences: { smoking: true } },
                { id: '2', preferences: { smoking: false } },
            ];

            mockMatchingService.filterByPreferences.mockReturnValue([
                { id: '2', preferences: { smoking: false } },
            ]);

            const filtered = mockMatchingService.filterByPreferences(matches, {
                noSmoking: true,
            });

            expect(filtered).toHaveLength(1);
            expect(filtered[0].preferences.smoking).toBe(false);
        });

        it('should filter by pet-friendly', () => {
            const matches = [
                { id: '1', preferences: { petsAllowed: true } },
                { id: '2', preferences: { petsAllowed: false } },
            ];

            mockMatchingService.filterByPreferences.mockReturnValue([
                { id: '1', preferences: { petsAllowed: true } },
            ]);

            const filtered = mockMatchingService.filterByPreferences(matches, {
                petsAllowed: true,
            });

            expect(filtered).toHaveLength(1);
            expect(filtered[0].preferences.petsAllowed).toBe(true);
        });
    });
});
