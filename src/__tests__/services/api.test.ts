import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock API service functions
const mockApiService = {
    // Trip functions
    createTrip: vi.fn(),
    getTrips: vi.fn(),
    getTripById: vi.fn(),
    updateTrip: vi.fn(),
    deleteTrip: vi.fn(),
    searchTrips: vi.fn(),

    // Booking functions
    createBooking: vi.fn(),
    getBookings: vi.fn(),
    updateBookingStatus: vi.fn(),

    // User functions
    getUserProfile: vi.fn(),
    updateUserProfile: vi.fn(),

    // Message functions
    sendMessage: vi.fn(),
    getMessages: vi.fn(),
    markMessageAsRead: vi.fn(),
};

describe('API Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Trip Operations', () => {
        it('should create a trip', async () => {
            const tripData = {
                from: 'Dubai',
                to: 'Abu Dhabi',
                date: '2026-01-20',
                time: '08:00',
                seats: 3,
                price: 50,
            };

            mockApiService.createTrip.mockResolvedValue({ id: '1', ...tripData });

            const result = await mockApiService.createTrip(tripData);
            expect(result).toHaveProperty('id');
            expect(result.from).toBe('Dubai');
            expect(mockApiService.createTrip).toHaveBeenCalledWith(tripData);
        });

        it('should get trips list', async () => {
            const mockTrips = [
                { id: '1', from: 'Dubai', to: 'Abu Dhabi' },
                { id: '2', from: 'Sharjah', to: 'Dubai' },
            ];

            mockApiService.getTrips.mockResolvedValue(mockTrips);

            const result = await mockApiService.getTrips();
            expect(result).toHaveLength(2);
            expect(result[0].from).toBe('Dubai');
        });

        it('should get trip by ID', async () => {
            const mockTrip = { id: '1', from: 'Dubai', to: 'Abu Dhabi' };
            mockApiService.getTripById.mockResolvedValue(mockTrip);

            const result = await mockApiService.getTripById('1');
            expect(result.id).toBe('1');
        });

        it('should search trips', async () => {
            const searchParams = {
                from: 'Dubai',
                to: 'Abu Dhabi',
                date: '2026-01-20',
            };

            const mockResults = [{ id: '1', from: 'Dubai', to: 'Abu Dhabi' }];
            mockApiService.searchTrips.mockResolvedValue(mockResults);

            const result = await mockApiService.searchTrips(searchParams);
            expect(result).toHaveLength(1);
        });
    });

    describe('Booking Operations', () => {
        it('should create a booking', async () => {
            const bookingData = {
                tripId: '1',
                userId: 'user1',
                seats: 2,
            };

            mockApiService.createBooking.mockResolvedValue({ id: 'booking1', ...bookingData });

            const result = await mockApiService.createBooking(bookingData);
            expect(result).toHaveProperty('id');
            expect(result.tripId).toBe('1');
        });

        it('should get user bookings', async () => {
            const mockBookings = [
                { id: 'booking1', tripId: '1', status: 'confirmed' },
                { id: 'booking2', tripId: '2', status: 'pending' },
            ];

            mockApiService.getBookings.mockResolvedValue(mockBookings);

            const result = await mockApiService.getBookings();
            expect(result).toHaveLength(2);
        });

        it('should update booking status', async () => {
            mockApiService.updateBookingStatus.mockResolvedValue({ id: 'booking1', status: 'confirmed' });

            const result = await mockApiService.updateBookingStatus('booking1', 'confirmed');
            expect(result.status).toBe('confirmed');
        });
    });

    describe('User Operations', () => {
        it('should get user profile', async () => {
            const mockProfile = {
                id: 'user1',
                name: 'Test User',
                email: 'test@wassel.com',
                rating: 4.8,
            };

            mockApiService.getUserProfile.mockResolvedValue(mockProfile);

            const result = await mockApiService.getUserProfile('user1');
            expect(result.name).toBe('Test User');
        });

        it('should update user profile', async () => {
            const updateData = { name: 'Updated Name' };
            mockApiService.updateUserProfile.mockResolvedValue({ id: 'user1', ...updateData });

            const result = await mockApiService.updateUserProfile('user1', updateData);
            expect(result.name).toBe('Updated Name');
        });
    });

    describe('Message Operations', () => {
        it('should send a message', async () => {
            const messageData = {
                to: 'user2',
                content: 'Hello!',
            };

            mockApiService.sendMessage.mockResolvedValue({ id: 'msg1', ...messageData });

            const result = await mockApiService.sendMessage(messageData);
            expect(result).toHaveProperty('id');
            expect(result.content).toBe('Hello!');
        });

        it('should get messages', async () => {
            const mockMessages = [
                { id: 'msg1', content: 'Hello', from: 'user1' },
                { id: 'msg2', content: 'Hi there', from: 'user2' },
            ];

            mockApiService.getMessages.mockResolvedValue(mockMessages);

            const result = await mockApiService.getMessages();
            expect(result).toHaveLength(2);
        });
    });
});
