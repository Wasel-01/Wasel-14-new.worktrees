/**
 * Scheduled Trips Component
 * 
 * Advanced trip scheduling with calendar view and recurring trips.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Calendar, Clock, MapPin, Repeat, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/api';
import { toast } from 'sonner';

interface ScheduledTrip {
  id: string;
  from_location: string;
  to_location: string;
  scheduled_date: string;
  scheduled_time: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  status: 'scheduled' | 'matched' | 'completed' | 'cancelled';
  fare_estimate: number;
  created_at: string;
}

export function ScheduledTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<ScheduledTrip[]>([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  useEffect(() => {
    if (user) {
      loadScheduledTrips();
    }
  }, [user]);

  const loadScheduledTrips = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_trips')
        .select('*')
        .eq('user_id', user?.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      // Mock data for demo
      const mockTrips: ScheduledTrip[] = [
        {
          id: '1',
          from_location: 'Dubai Marina',
          to_location: 'Dubai Mall',
          scheduled_date: '2026-01-05',
          scheduled_time: '09:00',
          recurrence: 'weekly',
          status: 'scheduled',
          fare_estimate: 45.00,
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          from_location: 'Home',
          to_location: 'Office',
          scheduled_date: '2026-01-03',
          scheduled_time: '08:00',
          recurrence: 'daily',
          status: 'scheduled',
          fare_estimate: 35.00,
          created_at: new Date().toISOString(),
        },
      ];

      setTrips(data?.length ? data : mockTrips);
    } catch (error) {
      console.error('Failed to load scheduled trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleTrip = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromLocation || !toLocation || !scheduledDate || !scheduledTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate date is in the future
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      toast.error('Scheduled time must be in the future');
      return;
    }

    setLoading(true);

    try {
      // Calculate fare estimate (simplified)
      const fareEstimate = 40 + Math.random() * 20;

      const { error } = await supabase.from('scheduled_trips').insert({
        user_id: user?.id,
        from_location: fromLocation,
        to_location: toLocation,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        recurrence,
        status: 'scheduled',
        fare_estimate: fareEstimate,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success(
        recurrence === 'none'
          ? 'Trip scheduled successfully!'
          : `Recurring trip scheduled (${recurrence})`
      );

      // Reset form
      setFromLocation('');
      setToLocation('');
      setScheduledDate('');
      setScheduledTime('');
      setRecurrence('none');
      setShowScheduleForm(false);

      loadScheduledTrips();
    } catch (error) {
      console.error('Failed to schedule trip:', error);
      toast.error('Failed to schedule trip');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelScheduled = async (tripId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this scheduled trip?'
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('scheduled_trips')
        .update({ status: 'cancelled' })
        .eq('id', tripId);

      if (error) throw error;

      toast.success('Scheduled trip cancelled');
      loadScheduledTrips();
    } catch (error) {
      console.error('Failed to cancel trip:', error);
      toast.error('Failed to cancel trip');
    }
  };

  const getRecurrenceBadge = (recurrence: string) => {
    if (recurrence === 'none') return null;

    return (
      <Badge variant="outline">
        <Repeat className="w-3 h-3 mr-1" />
        {recurrence}
      </Badge>
    );
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scheduled Trips</h1>
          <p className="text-muted-foreground">
            Plan your trips in advance
          </p>
        </div>
        {!showScheduleForm && (
          <Button onClick={() => setShowScheduleForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Trip
          </Button>
        )}
      </div>

      {/* Schedule Form */}
      {showScheduleForm && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Schedule a Trip</CardTitle>
            <CardDescription>
              Book a trip for later or set up recurring trips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScheduleTrip} className="space-y-4">
              <div>
                <Label htmlFor="from">Pickup Location *</Label>
                <Input
                  id="from"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  placeholder="Enter pickup address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="to">Dropoff Location *</Label>
                <Input
                  id="to"
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  placeholder="Enter destination address"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={getMinDate()}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="recurrence">Recurrence</Label>
                <Select value={recurrence} onValueChange={(v) => setRecurrence(v as typeof recurrence)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">One-time trip</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                {recurrence !== 'none' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    This trip will repeat {recurrence}
                  </p>
                )}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-semibold mb-1">Benefits of Scheduling</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Guaranteed driver availability</li>
                  <li>✓ Price lock - no surge pricing</li>
                  <li>✓ Priority matching</li>
                  <li>✓ Reminder notifications</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Scheduling...' : 'Schedule Trip'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScheduleForm(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Trips List */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Trips</CardTitle>
          <CardDescription>Your scheduled and recurring trips</CardDescription>
        </CardHeader>
        <CardContent>
          {trips.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No scheduled trips</p>
              <p className="text-sm text-muted-foreground">
                Schedule trips in advance for better planning
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {trips
                .filter(t => t.status === 'scheduled')
                .map((trip) => (
                  <div key={trip.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Scheduled</Badge>
                        {getRecurrenceBadge(trip.recurrence)}
                      </div>
                      <span className="font-semibold">
                        AED {trip.fare_estimate.toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-muted-foreground">From:</span>{' '}
                          {trip.from_location}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-muted-foreground">To:</span>{' '}
                          {trip.to_location}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(trip.scheduled_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {trip.scheduled_time}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelScheduled(trip.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">How Scheduled Trips Work</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>1. Schedule your trip at least 2 hours in advance</li>
            <li>2. We'll match you with a driver closer to your scheduled time</li>
            <li>3. Receive notifications 30 minutes and 5 minutes before pickup</li>
            <li>4. Cancel free of charge up to 1 hour before scheduled time</li>
            <li>5. For recurring trips, each instance can be managed separately</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
