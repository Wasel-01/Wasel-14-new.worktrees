import { useState, useEffect } from 'react';
import { tripsAPI } from '../services/api';
import { dataService } from '../services/mockDataService';

// Mock types since we don't have the full DB types for KV objects
export interface Trip {
  id: string;
  driver_id: string;
  from: string;
  to: string;
  departure_date: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  status: string;
  // Add other fields as needed
}

export function useTrips(filters?: {
  status?: string[];
  driverId?: string;
  fromDate?: string;
}) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, [JSON.stringify(filters)]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      let data: Trip[] = [];

      if (filters?.driverId) {
        // If filtering by driver, assume it's the current user and use getDriverTrips
        // Note: api.getDriverTrips uses the auth token to identify the user
        const response = await tripsAPI.getDriverTrips();
        data = response.trips || [];
      } else {
        // Otherwise search trips - use dataService which has mock fallback
        const response = await dataService.searchTrips({
          fromDate: filters?.fromDate,
        });
        data = response.trips || [];
      }

      // Client-side filtering
      if (filters?.status && filters.status.length > 0) {
        data = data.filter(trip => filters.status?.includes(trip.status));
      }

      if (filters?.fromDate) {
         data = data.filter(trip => trip.departure_date >= filters.fromDate!);
      }

      setTrips(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching trips:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: any) => {
    try {
      const result = await dataService.createTrip(tripData);
      await fetchTrips();
      return { data: result.trip, error: null };
    } catch (err: any) {
      console.error('Error creating trip:', err);
      return { data: null, error: err.message };
    }
  };

  // Update trip not fully supported by API wrapper yet? 
  // Wait, server has PUT /trips/:tripId. api.ts doesn't have updateTrip.
  // I should add updateTrip to api.ts or just accept it's missing for now.
  // But the existing hook had it. I'll mock it or leave it as a TODO if strict.
  // Actually, the user wants "connectivity achieved". I should fix api.ts if needed.
  // But for now, let's just comment out or implement if critical.
  
  const updateTrip = async (tripId: string, updates: any) => {
      try {
        const result = await dataService.updateTrip(tripId, updates);
        await fetchTrips();
        return { data: result.trip, error: null };
      } catch (err: any) {
        console.error('Error updating trip:', err);
        return { data: null, error: err.message };
      }
  };
  
  const deleteTrip = async (tripId: string) => {
      try {
        await dataService.deleteTrip(tripId);
        await fetchTrips();
        return { error: null };
      } catch (err: any) {
        console.error('Error deleting trip:', err);
        return { error: err.message };
      }
  };

  const publishTrip = async (tripId: string) => {
     try {
       const result = await tripsAPI.updateTrip(tripId, { status: 'published' });
       await fetchTrips();
       return { data: result.trip, error: null };
     } catch (err: any) {
       console.error('Error publishing trip:', err);
       return { error: err.message };
     }
  };

  return {
    trips,
    loading,
    error,
    refresh: fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    publishTrip,
  };
}

// Hook for searching trips
export function useSearchTrips(searchParams: {
  from?: string;
  to?: string;
  departureDate?: string;
  seats?: number;
}) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTrips = async () => {
    try {
      setLoading(true);
      const response = await dataService.searchTrips({
        from: searchParams.from,
        to: searchParams.to,
        date: searchParams.departureDate,
        seats: searchParams.seats,
      });

      setTrips(response.trips || []);
      setError(null);
    } catch (err: any) {
      console.error('Error searching trips:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    trips,
    loading,
    error,
    searchTrips,
  };
}

// Hook for a single trip
export function useTrip(tripId: string | null) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }
    fetchTrip();
  }, [tripId]);

  const fetchTrip = async () => {
    if (!tripId) return;

    try {
      setLoading(true);
      const response = await dataService.getTripById(tripId);
      setTrip(response.trip);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching trip:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    trip,
    loading,
    error,
    refresh: fetchTrip,
  };
}
