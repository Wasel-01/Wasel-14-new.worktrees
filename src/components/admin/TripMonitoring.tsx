/**
 * Trip Monitoring Component
 * 
 * Real-time monitoring of all active trips with
 * live location tracking and intervention capabilities.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MapPin, Clock, DollarSign, AlertTriangle, Eye, Phone } from 'lucide-react';
import { supabase } from '../../services/api';
import { realTimeTrackingService } from '../../services/realTimeTracking';
import { toast } from 'sonner';

interface LiveTrip {
  id: string;
  status: string;
  passenger: {
    id: string;
    name: string;
    photo?: string;
    rating: number;
  };
  driver: {
    id: string;
    name: string;
    photo?: string;
    rating: number;
  };
  from: string;
  to: string;
  fare: number;
  startTime: string;
  eta: string | null;
  distance: number;
  hasEmergency: boolean;
}

export function TripMonitoring() {
  const [liveTrips, setLiveTrips] = useState<LiveTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<LiveTrip | null>(null);

  useEffect(() => {
    loadLiveTrips();
    
    // Subscribe to trip updates
    const channel = supabase
      .channel('admin-trips')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trips',
        },
        () => {
          loadLiveTrips();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLiveTrips = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          passenger:passenger_id(id, full_name, avatar_url, rating),
          driver:driver_id(id, full_name, avatar_url, rating)
        `)
        .in('status', ['waiting', 'arriving', 'picked_up', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check for emergency alerts
      const tripIds = (data || []).map((t: any) => t.id);
      const { data: emergencyAlerts } = await supabase
        .from('emergency_alerts')
        .select('trip_id')
        .in('trip_id', tripIds)
        .eq('status', 'active');

      const emergencyTripIds = new Set(
        (emergencyAlerts || []).map((a: any) => a.trip_id)
      );

      const trips: LiveTrip[] = (data || []).map(trip => ({
        id: trip.id,
        status: trip.status,
        passenger: {
          id: trip.passenger?.id || '',
          name: trip.passenger?.full_name || 'Unknown',
          photo: trip.passenger?.avatar_url,
          rating: trip.passenger?.rating || 0,
        },
        driver: {
          id: trip.driver?.id || '',
          name: trip.driver?.full_name || 'Unknown',
          photo: trip.driver?.avatar_url,
          rating: trip.driver?.rating || 0,
        },
        from: trip.from_location || 'Unknown',
        to: trip.to_location || 'Unknown',
        fare: trip.fare || 0,
        startTime: trip.created_at,
        eta: trip.eta,
        distance: trip.distance || 0,
        hasEmergency: emergencyTripIds.has(trip.id),
      }));

      setLiveTrips(trips);
    } catch (error) {
      console.error('Failed to load live trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      waiting: { variant: 'secondary' as const, label: 'Waiting' },
      arriving: { variant: 'default' as const, label: 'Arriving' },
      picked_up: { variant: 'default' as const, label: 'Picked Up' },
      in_progress: { variant: 'default' as const, label: 'In Progress' },
    };

    const { variant, label } = config[status as keyof typeof config] || { variant: 'outline' as const, label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleViewTrip = (trip: LiveTrip) => {
    setSelectedTrip(trip);
    // Show trip details modal with map
    // In production, this would open a modal with full trip details and map
    toast.info(`Viewing trip ${trip.id.slice(0, 8)} - Map integration pending`);
  };

  const handleInterventionCall = async (trip: LiveTrip) => {
    toast.info('Initiating intervention call...');
    try {
      const { twilioService } = await import('../../services/twilioService');
      
      // Get phone numbers from profiles
      const { data: driverProfile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', trip.driver.id)
        .single();

      const { data: passengerProfile } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', trip.passenger.id)
        .single();

      if (driverProfile?.phone && passengerProfile?.phone) {
        const result = await twilioService.createConferenceCall(
          driverProfile.phone,
          passengerProfile.phone,
          trip.id
        );

        if (result.success) {
          toast.success('Conference call initiated');
        } else {
          toast.error(result.error || 'Failed to initiate call');
        }
      } else {
        toast.error('Phone numbers not available for participants');
      }
    } catch (error) {
      console.error('Intervention call failed:', error);
      toast.error('Failed to initiate intervention call');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{liveTrips.length}</div>
            <p className="text-sm text-muted-foreground">Active Trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {liveTrips.filter(t => t.status === 'waiting').length}
            </div>
            <p className="text-sm text-muted-foreground">Waiting for Pickup</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {liveTrips.filter(t => t.status === 'in_progress').length}
            </div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {liveTrips.filter(t => t.hasEmergency).length}
            </div>
            <p className="text-sm text-muted-foreground">Emergency Alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Trips List */}
      <Card>
        <CardHeader>
          <CardTitle>Live Trips</CardTitle>
        </CardHeader>
        <CardContent>
          {liveTrips.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No active trips at the moment
            </div>
          ) : (
            <div className="space-y-4">
              {liveTrips.map((trip) => (
                <div
                  key={trip.id}
                  className={`p-4 border rounded-lg ${
                    trip.hasEmergency ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(trip.status)}
                      {trip.hasEmergency && (
                        <Badge variant="destructive">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          EMERGENCY
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        Trip ID: {trip.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewTrip(trip)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {trip.hasEmergency && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleInterventionCall(trip)}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Passenger Info */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Passenger</p>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={trip.passenger.photo} />
                          <AvatarFallback>{trip.passenger.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{trip.passenger.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ⭐ {trip.passenger.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Driver Info */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Driver</p>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={trip.driver.photo} />
                          <AvatarFallback>{trip.driver.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{trip.driver.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ⭐ {trip.driver.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-muted-foreground">From:</span> {trip.from}
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-muted-foreground">To:</span> {trip.to}
                      </div>
                    </div>
                  </div>

                  {/* Trip Stats */}
                  <div className="mt-4 flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {trip.eta
                          ? `ETA ${new Date(trip.eta).toLocaleTimeString()}`
                          : 'Calculating...'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>AED {trip.fare.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{(trip.distance / 1000).toFixed(1)} km</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
