import { useState, useEffect } from 'react';
import { bookingsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { dataService } from '../services/mockDataService';

// Mock types
export interface Booking {
  id: string;
  trip_id: string;
  passenger_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  seats_requested: number;
  pickup_stop?: string;
  dropoff_stop?: string;
  created_at: string;
  // Expanded fields
  trip?: any;
  passenger?: any;
}

export function useBookings(filters?: {
  status?: string[];
  tripId?: string;
  passengerId?: string;
}) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, JSON.stringify(filters)]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let data: Booking[] = [];

      if (filters?.tripId) {
        // Fetch bookings for a specific trip (driver view)
        const response = await bookingsAPI.getTripBookings(filters.tripId);
        data = response.bookings || [];
      } else {
        // Fetch bookings for the current user (passenger view)
        try {
          const response = await bookingsAPI.getUserBookings();
          data = response.bookings || [];
        } catch (error) {
          // Fallback to mock data
          const response = await dataService.getUserBookings(user.id);
          data = response.bookings || [];
        }
      }

      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        data = data.filter(booking => filters.status?.includes(booking.status));
      }
      
      // If passengerId filter is set, we might be filtering the trip bookings list
      if (filters?.passengerId) {
          data = data.filter(booking => booking.passenger_id === filters.passengerId);
      }

      setBookings(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: any) => {
    try {
      const result = await dataService.createBooking(
          bookingData.trip_id,
          bookingData.seats_requested || 1,
          bookingData.pickup_stop,
          bookingData.dropoff_stop
      );
      await fetchBookings();
      return { data: result.booking, error: null };
    } catch (err: any) {
      console.error('Error creating booking:', err);
      return { data: null, error: err.message };
    }
  };

  const updateBooking = async (bookingId: string, updates: any) => {
    // Only status update is supported by API
    if (updates.status) {
        try {
            const result = await bookingsAPI.updateBookingStatus(bookingId, updates.status);
            await fetchBookings();
            return { data: result.booking, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    }
    return { data: null, error: 'Only status updates are supported' };
  };

  const acceptBooking = async (bookingId: string) => {
    return updateBooking(bookingId, { status: 'accepted' });
  };

  const rejectBooking = async (bookingId: string, reason?: string) => {
    return updateBooking(bookingId, { status: 'rejected' });
  };

  const cancelBooking = async (bookingId: string, reason?: string) => {
    return updateBooking(bookingId, { status: 'cancelled' });
  };

  return {
    bookings,
    loading,
    error,
    refresh: fetchBookings,
    createBooking,
    updateBooking,
    acceptBooking,
    rejectBooking,
    cancelBooking,
  };
}

// Hook for my trips (as passenger)
export function useMyBookings() {
  const { user } = useAuth();
  return useBookings({ passengerId: user?.id });
}
