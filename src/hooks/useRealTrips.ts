import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

interface Trip {
  id: string;
  driver_id: string;
  from: string;
  to: string;
  departure_date: string;
  departure_time: string;
  price_per_seat: number;
  total_seats: number;
  available_seats: number;
  trip_type: 'wasel' | 'raje3';
  status: string;
  stops?: Array<{ lat: number; lng: number; label: string }>;
  preferences?: {
    smoking_allowed: boolean;
    pets_allowed: boolean;
    music_allowed: boolean;
  };
  vehicle?: {
    make: string;
    model: string;
    year: number;
    color: string;
    plate_number: string;
  };
  created_at: string;
  updated_at: string;
}

export function useRealTrips() {
  const { user, session } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrip = async (tripData: Partial<Trip>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
        body: JSON.stringify(tripData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create trip');

      return { success: true, trip: data.trip };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const searchTrips = async (params: {
    from?: string;
    to?: string;
    date?: string;
    seats?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (params.from) queryParams.append('from', params.from);
      if (params.to) queryParams.append('to', params.to);
      if (params.date) queryParams.append('date', params.date);
      if (params.seats) queryParams.append('seats', params.seats.toString());

      const response = await fetch(`${API_BASE}/trips/search?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to search trips');

      setTrips(data.trips || []);
      return { success: true, trips: data.trips };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getTrip = async (tripId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/trips/${tripId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch trip');

      return { success: true, trip: data.trip };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/trips/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update trip');

      return { success: true, trip: data.trip };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    trips,
    loading,
    error,
    createTrip,
    searchTrips,
    getTrip,
    updateTrip,
  };
}
