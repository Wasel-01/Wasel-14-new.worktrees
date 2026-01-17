/**
 * Mock Data Service
 * 
 * Provides comprehensive mock data for all services to enable testing
 * and development without backend dependencies.
 */

import { tripsAPI, bookingsAPI } from './api';

// ============ MOCK DATA GENERATORS ============

export interface MockTrip {
  id: string;
  driver_id: string;
  driver_name: string;
  driver_rating: number;
  driver_photo?: string;
  from: string;
  to: string;
  from_coords: { lat: number; lng: number };
  to_coords: { lat: number; lng: number };
  departure_date: string;
  departure_time: string;
  price_per_seat: number;
  total_seats: number;
  available_seats: number;
  trip_type: 'wasel' | 'raje3' | 'package';
  status: 'published' | 'in_progress' | 'completed' | 'cancelled';
  vehicle?: {
    make: string;
    model: string;
    year: number;
    color: string;
    plate_number: string;
  };
  preferences?: {
    smoking_allowed: boolean;
    pets_allowed: boolean;
    music_allowed: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface MockBooking {
  id: string;
  trip_id: string;
  passenger_id: string;
  passenger_name: string;
  seats_requested: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  total_price: number;
  pickup_stop?: string;
  dropoff_stop?: string;
  created_at: string;
  trip?: any;
}

export interface MockRental {
  id: string;
  vehicle_id: string;
  vehicle_name: string;
  user_id: string;
  pickup_location: string;
  return_location: string;
  pickup_date: string;
  return_date: string;
  total_cost: number;
  status: 'active' | 'completed' | 'cancelled';
}

// ============ MOCK DATA STORAGE ============

class MockDataStore {
  private trips: MockTrip[] = [];
  private bookings: MockBooking[] = [];
  private rentals: MockRental[] = [];
  private nextTripId = 1;
  private nextBookingId = 1;
  private nextRentalId = 1;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with sample trips
    this.trips = [
      {
        id: 'trip-1',
        driver_id: 'driver-1',
        driver_name: 'Ahmed Al-Mansoori',
        driver_rating: 4.8,
        driver_photo: 'https://i.pravatar.cc/150?img=12',
        from: 'Dubai Marina',
        to: 'Abu Dhabi',
        from_coords: { lat: 25.0772, lng: 55.1398 },
        to_coords: { lat: 24.4539, lng: 54.3773 },
        departure_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        departure_time: '08:00',
        price_per_seat: 45,
        total_seats: 4,
        available_seats: 2,
        trip_type: 'wasel',
        status: 'published',
        vehicle: {
          make: 'Toyota',
          model: 'Camry',
          year: 2022,
          color: 'White',
          plate_number: 'DXB-1234',
        },
        preferences: {
          smoking_allowed: false,
          pets_allowed: true,
          music_allowed: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'trip-2',
        driver_id: 'driver-2',
        driver_name: 'Sarah Al-Zahra',
        driver_rating: 4.9,
        driver_photo: 'https://i.pravatar.cc/150?img=47',
        from: 'Riyadh',
        to: 'Jeddah',
        from_coords: { lat: 24.7136, lng: 46.6753 },
        to_coords: { lat: 21.5433, lng: 39.1728 },
        departure_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        departure_time: '14:30',
        price_per_seat: 120,
        total_seats: 3,
        available_seats: 1,
        trip_type: 'wasel',
        status: 'published',
        vehicle: {
          make: 'Honda',
          model: 'Accord',
          year: 2023,
          color: 'Black',
          plate_number: 'RYD-5678',
        },
        preferences: {
          smoking_allowed: false,
          pets_allowed: false,
          music_allowed: true,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'trip-3',
        driver_id: 'driver-3',
        driver_name: 'Mohammed Hassan',
        driver_rating: 4.7,
        driver_photo: 'https://i.pravatar.cc/150?img=33',
        from: 'Cairo',
        to: 'Alexandria',
        from_coords: { lat: 30.0444, lng: 31.2357 },
        to_coords: { lat: 31.2001, lng: 29.9187 },
        departure_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        departure_time: '09:15',
        price_per_seat: 80,
        total_seats: 4,
        available_seats: 3,
        trip_type: 'raje3',
        status: 'published',
        vehicle: {
          make: 'Nissan',
          model: 'Altima',
          year: 2021,
          color: 'Silver',
          plate_number: 'CAI-9012',
        },
        preferences: {
          smoking_allowed: false,
          pets_allowed: true,
          music_allowed: false,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  // ============ TRIP OPERATIONS ============

  async createTrip(tripData: Partial<MockTrip>): Promise<MockTrip> {
    const newTrip: MockTrip = {
      id: `trip-${this.nextTripId++}`,
      driver_id: tripData.driver_id || 'current-user',
      driver_name: tripData.driver_name || 'You',
      driver_rating: tripData.driver_rating || 5.0,
      from: tripData.from || '',
      to: tripData.to || '',
      from_coords: tripData.from_coords || { lat: 25.2048, lng: 55.2708 },
      to_coords: tripData.to_coords || { lat: 24.4539, lng: 54.3773 },
      departure_date: tripData.departure_date || new Date().toISOString().split('T')[0],
      departure_time: tripData.departure_time || '12:00',
      price_per_seat: tripData.price_per_seat || 50,
      total_seats: tripData.total_seats || 4,
      available_seats: tripData.available_seats || tripData.total_seats || 4,
      trip_type: tripData.trip_type || 'wasel',
      status: 'published',
      vehicle: tripData.vehicle,
      preferences: tripData.preferences,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.trips.push(newTrip);
    return newTrip;
  }

  async searchTrips(filters: {
    from?: string;
    to?: string;
    date?: string;
    seats?: number;
  }): Promise<MockTrip[]> {
    let results = [...this.trips];

    if (filters.from) {
      results = results.filter(trip =>
        trip.from.toLowerCase().includes(filters.from!.toLowerCase())
      );
    }

    if (filters.to) {
      results = results.filter(trip =>
        trip.to.toLowerCase().includes(filters.to!.toLowerCase())
      );
    }

    if (filters.date) {
      results = results.filter(trip => trip.departure_date === filters.date);
    }

    if (filters.seats) {
      results = results.filter(trip => trip.available_seats >= filters.seats!);
    }

    return results.filter(trip => trip.status === 'published');
  }

  async getTripById(tripId: string): Promise<MockTrip | null> {
    return this.trips.find(t => t.id === tripId) || null;
  }

  async updateTrip(tripId: string, updates: Partial<MockTrip>): Promise<MockTrip | null> {
    const index = this.trips.findIndex(t => t.id === tripId);
    if (index === -1) return null;

    this.trips[index] = {
      ...this.trips[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return this.trips[index];
  }

  async deleteTrip(tripId: string): Promise<boolean> {
    const index = this.trips.findIndex(t => t.id === tripId);
    if (index === -1) return false;

    this.trips.splice(index, 1);
    return true;
  }

  // ============ BOOKING OPERATIONS ============

  async createBooking(
    tripId: string,
    seatsRequested: number,
    passengerId?: string,
    pickup?: string,
    dropoff?: string
  ): Promise<MockBooking> {
    const trip = await this.getTripById(tripId);
    if (!trip) {
      throw new Error('Trip not found');
    }

    if (trip.available_seats < seatsRequested) {
      throw new Error('Not enough available seats');
    }

    const newBooking: MockBooking = {
      id: `booking-${this.nextBookingId++}`,
      trip_id: tripId,
      passenger_id: passengerId || 'current-user',
      passenger_name: 'You',
      seats_requested: seatsRequested,
      status: 'pending',
      total_price: trip.price_per_seat * seatsRequested,
      created_at: new Date().toISOString(),
      pickup_stop: pickup,
      dropoff_stop: dropoff,
    };

    // Update trip available seats
    trip.available_seats -= seatsRequested;
    trip.updated_at = new Date().toISOString();

    this.bookings.push(newBooking);
    return newBooking;
  }

  async getBookingsByTrip(tripId: string): Promise<MockBooking[]> {
    return this.bookings.filter(b => b.trip_id === tripId);
  }

  async getUserBookings(userId: string): Promise<{ bookings: MockBooking[] }> {
    const bookings = this.bookings.filter(b => b.passenger_id === userId);
    // Enrich with trip data
    const enriched = bookings.map(booking => {
      const trip = this.trips.find(t => t.id === booking.trip_id);
      return {
        ...booking,
        trip: trip ? {
          ...trip,
          driver_name: trip.driver_name,
          driver_photo: trip.driver_photo,
          driver_rating: trip.driver_rating,
          from: trip.from,
          to: trip.to,
          departure_date: trip.departure_date,
          departure_time: trip.departure_time,
          vehicle: trip.vehicle,
        } : null,
      };
    });
    return { bookings: enriched };
  }

  // ============ RENTAL OPERATIONS ============

  async createRental(rentalData: Partial<MockRental>): Promise<MockRental> {
    const newRental: MockRental = {
      id: `rental-${this.nextRentalId++}`,
      vehicle_id: rentalData.vehicle_id || 'vehicle-1',
      vehicle_name: rentalData.vehicle_name || 'Toyota Corolla',
      user_id: rentalData.user_id || 'current-user',
      pickup_location: rentalData.pickup_location || '',
      return_location: rentalData.return_location || rentalData.pickup_location || '',
      pickup_date: rentalData.pickup_date || new Date().toISOString().split('T')[0],
      return_date: rentalData.return_date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      total_cost: rentalData.total_cost || 150,
      status: 'active',
    };

    this.rentals.push(newRental);
    return newRental;
  }

  async getUserRentals(userId: string): Promise<{ rentals: MockRental[] }> {
    const rentals = this.rentals.filter(r => r.user_id === userId);
    return { rentals };
  }

  // ============ UTILITY METHODS ============

  getAllTrips(): MockTrip[] {
    return [...this.trips];
  }

  getAllBookings(): MockBooking[] {
    return [...this.bookings];
  }

  getAllRentals(): MockRental[] {
    return [...this.rentals];
  }

  clearAll(): void {
    this.trips = [];
    this.bookings = [];
    this.rentals = [];
    this.nextTripId = 1;
    this.nextBookingId = 1;
    this.nextRentalId = 1;
    this.initializeMockData();
  }
}

// ============ SINGLETON INSTANCE ============

export const mockDataStore = new MockDataStore();

// ============ API WRAPPER ============

/**
 * Enhanced API wrapper that uses mock data when backend is unavailable
 */
export const dataService = {
  // Trip operations
  async createTrip(tripData: any): Promise<any> {
    try {
      // Try real API first
      return await tripsAPI.createTrip(tripData);
    } catch (error) {
      // Fallback to mock data
      console.log('[Mock] Creating trip:', tripData);
      return { trip: await mockDataStore.createTrip(tripData) };
    }
  },

  async searchTrips(filters: {
    from?: string;
    to?: string;
    date?: string;
    seats?: number;
  }): Promise<any> {
    try {
      return await tripsAPI.searchTrips(filters.from, filters.to, filters.date, filters.seats);
    } catch (error) {
      console.log('[Mock] Searching trips:', filters);
      const trips = await mockDataStore.searchTrips(filters);
      return { trips };
    }
  },

  async getTripById(tripId: string): Promise<any> {
    try {
      return await tripsAPI.getTripById(tripId);
    } catch (error) {
      console.log('[Mock] Getting trip:', tripId);
      const trip = await mockDataStore.getTripById(tripId);
      return { trip };
    }
  },

  async updateTrip(tripId: string, updates: any): Promise<any> {
    try {
      return await tripsAPI.updateTrip(tripId, updates);
    } catch (error) {
      console.log('[Mock] Updating trip:', tripId, updates);
      const trip = await mockDataStore.updateTrip(tripId, updates);
      return { trip };
    }
  },

  async deleteTrip(tripId: string): Promise<any> {
    try {
      return await tripsAPI.deleteTrip(tripId);
    } catch (error) {
      console.log('[Mock] Deleting trip:', tripId);
      await mockDataStore.deleteTrip(tripId);
      return { success: true };
    }
  },

  // Booking operations
  async createBooking(
    tripId: string,
    seatsRequested: number,
    pickup?: string,
    dropoff?: string
  ): Promise<any> {
    try {
      return await bookingsAPI.createBooking(tripId, seatsRequested, pickup, dropoff);
    } catch (error) {
      console.log('[Mock] Creating booking:', tripId, seatsRequested);
      const booking = await mockDataStore.createBooking(tripId, seatsRequested, undefined, pickup, dropoff);
      // Enrich with trip data
      const trip = await mockDataStore.getTripById(tripId);
      return { 
        booking: {
          ...booking,
          trip: trip ? {
            ...trip,
            driver_name: trip.driver_name,
            driver_photo: trip.driver_photo,
            driver_rating: trip.driver_rating,
            from: trip.from,
            to: trip.to,
            departure_date: trip.departure_date,
            departure_time: trip.departure_time,
            vehicle: trip.vehicle,
          } : null,
        }
      };
    }
  },

  async getUserBookings(userId?: string): Promise<any> {
    try {
      return await bookingsAPI.getUserBookings();
    } catch (error) {
      console.log('[Mock] Getting user bookings');
      const bookings = await mockDataStore.getUserBookings(userId || 'current-user');
      return { bookings };
    }
  },

  // Rental operations
  async createRental(rentalData: any): Promise<any> {
    console.log('[Mock] Creating rental:', rentalData);
    const rental = await mockDataStore.createRental(rentalData);
    return { rental };
  },

  async getUserRentals(userId?: string): Promise<any> {
    console.log('[Mock] Getting user rentals');
    const rentals = await mockDataStore.getUserRentals(userId || 'current-user');
    return { rentals };
  },
};
