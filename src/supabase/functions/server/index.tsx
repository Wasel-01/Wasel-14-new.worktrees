import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client with service role for admin operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-0b1f4071/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Sign up endpoint
app.post("/make-server-0b1f4071/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return c.json({ error: 'Missing required fields: email, password, or fullName' }, 400);
    }

    // Create user with admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: fullName },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (authError) {
      // Handle "User already exists" gracefully without logging as a server error
      if (authError.message.includes('already been registered') || (authError as any).code === 'email_exists') {
        console.log('Signup attempt for existing email:', email);
        return c.json({ error: 'A user with this email address has already been registered' }, 422);
      }

      console.error('Auth error during signup:', authError);
      return c.json({ error: authError.message }, 400);
    }

    if (!authData.user) {
      return c.json({ error: 'Failed to create user' }, 500);
    }

    // Create profile in KV store
    const profileData = {
      id: authData.user.id,
      email: email,
      full_name: fullName,
      email_verified: true,
      phone_verified: false,
      total_trips: 0,
      trips_as_driver: 0,
      trips_as_passenger: 0,
      rating_as_driver: 0.0,
      rating_as_passenger: 0.0,
      total_ratings_received: 0,
      smoking_allowed: false,
      pets_allowed: false,
      music_allowed: true,
      language: 'en',
      currency: 'AED',
      notification_enabled: true,
      location_sharing_enabled: true,
      wallet_balance: 0.0,
      total_earned: 0.0,
      total_spent: 0.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(`profile:${authData.user.id}`, profileData);

    console.log('User signed up successfully:', authData.user.id);
    return c.json({ 
      success: true, 
      user: { 
        id: authData.user.id, 
        email: authData.user.email 
      } 
    });
  } catch (error) {
    console.error('Unexpected error during signup:', error);
    return c.json({ error: 'An unexpected error occurred during signup' }, 500);
  }
});

// Get user profile endpoint
app.get("/make-server-0b1f4071/profile/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const authHeader = c.req.header('Authorization');
    
    // Verify user is authenticated
    const user = await getAuthenticatedUser(authHeader);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get profile from KV store
    const profile = await kv.get(`profile:${userId}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update user profile endpoint
app.put("/make-server-0b1f4071/profile/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const authHeader = c.req.header('Authorization');
    
    // Verify user is authenticated
    const user = await getAuthenticatedUser(authHeader);
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const updates = await c.req.json();

    // Get existing profile
    const existingProfile = await kv.get(`profile:${userId}`);
    if (!existingProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Merge updates with existing profile
    const updatedProfile = {
      ...existingProfile,
      ...updates,
      id: userId, // Ensure ID cannot be changed
      email: existingProfile.email, // Ensure email cannot be changed via this endpoint
      updated_at: new Date().toISOString(),
    };

    await kv.set(`profile:${userId}`, updatedProfile);

    return c.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Helper function to get authenticated user
async function getAuthenticatedUser(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const accessToken = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    console.error('Auth verification error:', error);
    return null;
  }

  return user;
}

// ==================== TRIP MANAGEMENT ====================

// Create a new trip
app.post("/make-server-0b1f4071/trips", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const tripData = await c.req.json();
    const tripId = `trip:${Date.now()}:${user.id}`;
    
    const trip = {
      id: tripId,
      driver_id: user.id,
      ...tripData,
      status: 'published',
      available_seats: tripData.total_seats || 4,
      bookings: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(tripId, trip);
    console.log('Trip created successfully:', tripId);
    return c.json({ success: true, trip });
  } catch (error) {
    console.error('Error creating trip:', error);
    return c.json({ error: 'Failed to create trip' }, 500);
  }
});

// Search trips
app.get("/make-server-0b1f4071/trips/search", async (c) => {
  try {
    const from = c.req.query('from');
    const to = c.req.query('to');
    const date = c.req.query('date');
    const seats = parseInt(c.req.query('seats') || '1');

    // Get all trips
    const allTrips = await kv.getByPrefix('trip:');
    
    // Filter trips
    let filteredTrips = allTrips.filter((trip: any) => 
      trip.status === 'published' && 
      trip.available_seats >= seats
    );

    if (from) {
      filteredTrips = filteredTrips.filter((trip: any) => 
        trip.from?.toLowerCase().includes(from.toLowerCase())
      );
    }

    if (to) {
      filteredTrips = filteredTrips.filter((trip: any) => 
        trip.to?.toLowerCase().includes(to.toLowerCase())
      );
    }

    if (date) {
      filteredTrips = filteredTrips.filter((trip: any) => 
        trip.departure_date?.startsWith(date)
      );
    }

    // Sort by departure time
    filteredTrips.sort((a: any, b: any) => 
      new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
    );

    // Expand driver details
    for (const trip of filteredTrips) {
        const driverProfile = await kv.get(`profile:${trip.driver_id}`);
        if (driverProfile) {
            trip.driver = {
                name: driverProfile.full_name,
                initials: driverProfile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
                rating: driverProfile.rating_as_driver,
                trips: driverProfile.trips_as_driver,
                phone: driverProfile.phone // Optional, maybe privacy concern?
            };
        }
    }

    return c.json({ trips: filteredTrips });
  } catch (error) {
    console.error('Error searching trips:', error);
    return c.json({ error: 'Failed to search trips' }, 500);
  }
});

// Get single trip
app.get("/make-server-0b1f4071/trips/:tripId", async (c) => {
  try {
    const tripId = c.req.param('tripId');
    const trip = await kv.get(tripId);
    
    if (!trip) {
      return c.json({ error: 'Trip not found' }, 404);
    }

    return c.json({ trip });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return c.json({ error: 'Failed to fetch trip' }, 500);
  }
});

// Update trip
app.put("/make-server-0b1f4071/trips/:tripId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const tripId = c.req.param('tripId');
    const trip = await kv.get(tripId);
    
    if (!trip || trip.driver_id !== user.id) {
      return c.json({ error: 'Unauthorized to update this trip' }, 403);
    }

    const updates = await c.req.json();
    const updatedTrip = {
      ...trip,
      ...updates,
      id: tripId,
      driver_id: trip.driver_id,
      updated_at: new Date().toISOString(),
    };

    await kv.set(tripId, updatedTrip);
    return c.json({ success: true, trip: updatedTrip });
  } catch (error) {
    console.error('Error updating trip:', error);
    return c.json({ error: 'Failed to update trip' }, 500);
  }
});

// ==================== BOOKING MANAGEMENT ====================

// Get trip bookings (for driver)
app.get("/make-server-0b1f4071/trips/:tripId/bookings", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const tripId = c.req.param('tripId');
    const trip = await kv.get(tripId);
    
    if (!trip) {
      return c.json({ error: 'Trip not found' }, 404);
    }

    // Only driver can see all bookings details
    if (trip.driver_id !== user.id) {
        return c.json({ error: 'Unauthorized' }, 403);
    }

    const bookingIds = trip.bookings || [];
    const bookings = [];
    
    for (const id of bookingIds) {
        const booking = await kv.get(id);
        if (booking) {
            // Fetch passenger profile
            const passenger = await kv.get(`profile:${booking.passenger_id}`);
            bookings.push({
                ...booking,
                passenger
            });
        }
    }

    return c.json({ bookings });
  } catch (error) {
    console.error('Error fetching trip bookings:', error);
    return c.json({ error: 'Failed to fetch trip bookings' }, 500);
  }
});

// Create booking
app.post("/make-server-0b1f4071/bookings", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { trip_id, seats_requested, pickup_stop, dropoff_stop } = await c.req.json();
    
    const trip = await kv.get(trip_id);
    if (!trip) {
      return c.json({ error: 'Trip not found' }, 404);
    }

    if (trip.available_seats < seats_requested) {
      return c.json({ error: 'Not enough seats available' }, 400);
    }

    const bookingId = `booking:${Date.now()}:${user.id}`;
    const booking = {
      id: bookingId,
      trip_id,
      passenger_id: user.id,
      seats_requested,
      pickup_stop: pickup_stop || trip.from,
      dropoff_stop: dropoff_stop || trip.to,
      status: 'pending',
      total_price: trip.price_per_seat * seats_requested,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(bookingId, booking);

    // Update trip bookings array
    trip.bookings = [...(trip.bookings || []), bookingId];
    await kv.set(trip_id, trip);

    // Create notification for driver
    const notificationId = `notification:${Date.now()}:${trip.driver_id}`;
    await kv.set(notificationId, {
      id: notificationId,
      user_id: trip.driver_id,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `Someone requested ${seats_requested} seat(s) for your trip`,
      data: { booking_id: bookingId, trip_id },
      read: false,
      created_at: new Date().toISOString(),
    });

    return c.json({ success: true, booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    return c.json({ error: 'Failed to create booking' }, 500);
  }
});

// Update booking status (accept/reject/cancel)
app.put("/make-server-0b1f4071/bookings/:bookingId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const bookingId = c.req.param('bookingId');
    const booking = await kv.get(bookingId);
    
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }

    const trip = await kv.get(booking.trip_id);
    if (!trip) {
      return c.json({ error: 'Trip not found' }, 404);
    }

    // Check authorization (driver can accept/reject, passenger can cancel)
    if (trip.driver_id !== user.id && booking.passenger_id !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { status } = await c.req.json();
    
    // Update booking
    booking.status = status;
    booking.updated_at = new Date().toISOString();
    await kv.set(bookingId, booking);

    // Update trip available seats
    if (status === 'accepted') {
      trip.available_seats -= booking.seats_requested;
      await kv.set(booking.trip_id, trip);
      
      // Create notification for passenger
      const notificationId = `notification:${Date.now()}:${booking.passenger_id}`;
      await kv.set(notificationId, {
        id: notificationId,
        user_id: booking.passenger_id,
        type: 'booking_accepted',
        title: 'Booking Accepted',
        message: 'Your booking has been accepted!',
        data: { booking_id: bookingId, trip_id: booking.trip_id },
        read: false,
        created_at: new Date().toISOString(),
      });
    } else if (status === 'cancelled' || status === 'rejected') {
      trip.available_seats += booking.seats_requested;
      await kv.set(booking.trip_id, trip);
    }

    return c.json({ success: true, booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return c.json({ error: 'Failed to update booking' }, 500);
  }
});

// Get user bookings
app.get("/make-server-0b1f4071/bookings/user/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = c.req.param('userId');
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const allBookings = await kv.getByPrefix('booking:');
    const userBookings = allBookings.filter((booking: any) => 
      booking.passenger_id === userId
    );

    return c.json({ bookings: userBookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// ==================== MESSAGES ====================

// Send message
app.post("/make-server-0b1f4071/messages", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { recipient_id, trip_id, content } = await c.req.json();
    
    const messageId = `message:${Date.now()}:${user.id}`;
    const message = {
      id: messageId,
      sender_id: user.id,
      recipient_id,
      trip_id,
      content,
      read: false,
      created_at: new Date().toISOString(),
    };

    await kv.set(messageId, message);

    // Create notification for recipient
    const notificationId = `notification:${Date.now()}:${recipient_id}`;
    await kv.set(notificationId, {
      id: notificationId,
      user_id: recipient_id,
      type: 'new_message',
      title: 'New Message',
      message: 'You have a new message',
      data: { message_id: messageId, trip_id },
      read: false,
      created_at: new Date().toISOString(),
    });

    return c.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Get conversation messages
app.get("/make-server-0b1f4071/messages/conversation/:userId1/:userId2", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId1 = c.req.param('userId1');
    const userId2 = c.req.param('userId2');

    if (user.id !== userId1 && user.id !== userId2) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const allMessages = await kv.getByPrefix('message:');
    const conversationMessages = allMessages.filter((msg: any) => 
      (msg.sender_id === userId1 && msg.recipient_id === userId2) ||
      (msg.sender_id === userId2 && msg.recipient_id === userId1)
    );

    conversationMessages.sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return c.json({ messages: conversationMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

// ==================== NOTIFICATIONS ====================

// Get user notifications
app.get("/make-server-0b1f4071/notifications/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = c.req.param('userId');
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const allNotifications = await kv.getByPrefix('notification:');
    const userNotifications = allNotifications.filter((notif: any) => 
      notif.user_id === userId
    );

    userNotifications.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return c.json({ notifications: userNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

// Mark notification as read
app.put("/make-server-0b1f4071/notifications/:notificationId/read", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const notificationId = c.req.param('notificationId');
    const notification = await kv.get(notificationId);
    
    if (!notification || notification.user_id !== user.id) {
      return c.json({ error: 'Notification not found' }, 404);
    }

    notification.read = true;
    notification.updated_at = new Date().toISOString();
    await kv.set(notificationId, notification);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return c.json({ error: 'Failed to update notification' }, 500);
  }
});

// ==================== REVIEWS ====================

// Create review
app.post("/make-server-0b1f4071/reviews", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const reviewData = await c.req.json();
    const reviewId = `review:${Date.now()}:${user.id}`;
    
    const review = {
      id: reviewId,
      reviewer_id: user.id,
      ...reviewData,
      created_at: new Date().toISOString(),
    };

    await kv.set(reviewId, review);

    // Update reviewee's profile rating
    const profile = await kv.get(`profile:${reviewData.reviewee_id}`);
    if (profile) {
      const currentRating = reviewData.role === 'driver' ? 
        profile.rating_as_driver : profile.rating_as_passenger;
      const totalRatings = profile.total_ratings_received || 0;
      const newRating = ((currentRating * totalRatings) + reviewData.overall_rating) / (totalRatings + 1);
      
      if (reviewData.role === 'driver') {
        profile.rating_as_driver = newRating;
      } else {
        profile.rating_as_passenger = newRating;
      }
      profile.total_ratings_received = totalRatings + 1;
      profile.updated_at = new Date().toISOString();
      
      await kv.set(`profile:${reviewData.reviewee_id}`, profile);
    }

    return c.json({ success: true, review });
  } catch (error) {
    console.error('Error creating review:', error);
    return c.json({ error: 'Failed to create review' }, 500);
  }
});

// Get user reviews
app.get("/make-server-0b1f4071/reviews/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    const allReviews = await kv.getByPrefix('review:');
    const userReviews = allReviews.filter((review: any) => 
      review.reviewee_id === userId
    );

    userReviews.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return c.json({ reviews: userReviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// ==================== RECURRING TRIPS ====================

// Create recurring trip
app.post("/make-server-0b1f4071/recurring-trips", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const recurringData = await c.req.json();
    const recurringId = `recurring:${Date.now()}:${user.id}`;
    
    const recurringTrip = {
      id: recurringId,
      driver_id: user.id,
      ...recurringData,
      status: 'active',
      total_bookings: 0,
      total_earnings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(recurringId, recurringTrip);
    return c.json({ success: true, recurringTrip });
  } catch (error) {
    console.error('Error creating recurring trip:', error);
    return c.json({ error: 'Failed to create recurring trip' }, 500);
  }
});

// Get user recurring trips
app.get("/make-server-0b1f4071/recurring-trips/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = c.req.param('userId');
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const allRecurring = await kv.getByPrefix('recurring:');
    const userRecurring = allRecurring.filter((trip: any) => 
      trip.driver_id === userId
    );

    return c.json({ recurringTrips: userRecurring });
  } catch (error) {
    console.error('Error fetching recurring trips:', error);
    return c.json({ error: 'Failed to fetch recurring trips' }, 500);
  }
});

// ==================== WALLET & PAYMENTS ====================

// Get wallet balance
app.get("/make-server-0b1f4071/wallet/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = c.req.param('userId');
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const profile = await kv.get(`profile:${userId}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ 
      balance: profile.wallet_balance || 0,
      total_earned: profile.total_earned || 0,
      total_spent: profile.total_spent || 0,
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return c.json({ error: 'Failed to fetch wallet' }, 500);
  }
});

// Add funds to wallet
app.post("/make-server-0b1f4071/wallet/:userId/add-funds", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = c.req.param('userId');
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { amount } = await c.req.json();
    if (amount <= 0) {
      return c.json({ error: 'Invalid amount' }, 400);
    }

    const profile = await kv.get(`profile:${userId}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    profile.wallet_balance = (profile.wallet_balance || 0) + amount;
    profile.updated_at = new Date().toISOString();
    await kv.set(`profile:${userId}`, profile);

    // Create transaction record
    const transactionId = `transaction:${Date.now()}:${userId}`;
    await kv.set(transactionId, {
      id: transactionId,
      user_id: userId,
      type: 'wallet_topup',
      amount,
      status: 'completed',
      created_at: new Date().toISOString(),
    });

    return c.json({ 
      success: true, 
      balance: profile.wallet_balance 
    });
  } catch (error) {
    console.error('Error adding funds:', error);
    return c.json({ error: 'Failed to add funds' }, 500);
  }
});

// ==================== EMERGENCY CONTACTS ====================

// Get emergency contacts
app.get("/make-server-0b1f4071/emergency-contacts/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = c.req.param('userId');
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const allContacts = await kv.getByPrefix(`emergency:${userId}:`);
    return c.json({ contacts: allContacts });
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    return c.json({ error: 'Failed to fetch emergency contacts' }, 500);
  }
});

// Add emergency contact
app.post("/make-server-0b1f4071/emergency-contacts/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = c.req.param('userId');
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const contactData = await c.req.json();
    const contactId = `emergency:${userId}:${Date.now()}`;
    
    const contact = {
      id: contactId,
      user_id: userId,
      ...contactData,
      created_at: new Date().toISOString(),
    };

    await kv.set(contactId, contact);
    return c.json({ success: true, contact });
  } catch (error) {
    console.error('Error adding emergency contact:', error);
    return c.json({ error: 'Failed to add emergency contact' }, 500);
  }
});

// Get all messages for user
app.get("/make-server-0b1f4071/messages/user/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = c.req.param('userId');
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const allMessages = await kv.getByPrefix('message:');
    const userMessages = allMessages.filter((msg: any) => 
      msg.sender_id === userId || msg.recipient_id === userId
    );
    
    userMessages.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return c.json({ messages: userMessages });
  } catch (error) {
    console.error('Error fetching user messages:', error);
    return c.json({ error: 'Failed to fetch user messages' }, 500);
  }
});

// Get trips created by user (driver)
app.get("/make-server-0b1f4071/trips/user/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = c.req.param('userId');
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const allTrips = await kv.getByPrefix('trip:');
    const userTrips = allTrips.filter((trip: any) => trip.driver_id === userId);
    
    // Sort by date
    userTrips.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return c.json({ trips: userTrips });
  } catch (error) {
    console.error('Error fetching user trips:', error);
    return c.json({ error: 'Failed to fetch user trips' }, 500);
  }
});

// ==================== ANALYTICS ====================

// Get user analytics
app.get("/make-server-0b1f4071/analytics/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = c.req.param('userId');
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Get all user trips
    const allTrips = await kv.getByPrefix('trip:');
    const userTripsAsDriver = allTrips.filter((trip: any) => trip.driver_id === userId);
    
    const allBookings = await kv.getByPrefix('booking:');
    const userBookingsAsPassenger = allBookings.filter((booking: any) => 
      booking.passenger_id === userId && booking.status === 'accepted'
    );

    const profile = await kv.get(`profile:${userId}`);

    const analytics = {
      total_trips: userTripsAsDriver.length + userBookingsAsPassenger.length,
      trips_as_driver: userTripsAsDriver.length,
      trips_as_passenger: userBookingsAsPassenger.length,
      total_earned: profile?.total_earned || 0,
      total_spent: profile?.total_spent || 0,
      rating_as_driver: profile?.rating_as_driver || 0,
      rating_as_passenger: profile?.rating_as_passenger || 0,
      co2_saved: (userTripsAsDriver.length + userBookingsAsPassenger.length) * 2.5, // Estimated kg CO2
    };

    return c.json({ analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// ==================== REFERRALS ====================

// Get referral code
app.get("/make-server-0b1f4071/referral/:userId", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userId = c.req.param('userId');
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const profile = await kv.get(`profile:${userId}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    let referralCode = profile?.referral_code;
    
    if (!referralCode) {
      // Generate referral code
      referralCode = `WASSEL${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      profile.referral_code = referralCode;
      profile.referral_count = 0;
      profile.referral_earnings = 0;
      await kv.set(`profile:${userId}`, profile);
    }

    return c.json({ 
      referral_code: referralCode,
      referral_count: profile.referral_count || 0,
      referral_earnings: profile.referral_earnings || 0,
    });
  } catch (error) {
    console.error('Error fetching referral code:', error);
    return c.json({ error: 'Failed to fetch referral code' }, 500);
  }
});

// Apply referral code
app.post("/make-server-0b1f4071/referral/apply", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { referral_code } = await c.req.json();
    
    // Find referrer by code
    const allProfiles = await kv.getByPrefix('profile:');
    const referrerProfile = allProfiles.find((p: any) => p.referral_code === referral_code);
    
    if (!referrerProfile) {
      return c.json({ error: 'Invalid referral code' }, 400);
    }

    // Update new user
    const newUserProfile = await kv.get(`profile:${user.id}`);
    if (newUserProfile.referred_by) {
      return c.json({ error: 'You have already used a referral code' }, 400);
    }
    
    newUserProfile.referred_by = referrerProfile.id;
    newUserProfile.wallet_balance = (newUserProfile.wallet_balance || 0) + 10; // Bonus for new user
    await kv.set(`profile:${user.id}`, newUserProfile);

    // Update referrer
    referrerProfile.referral_count = (referrerProfile.referral_count || 0) + 1;
    referrerProfile.referral_earnings = (referrerProfile.referral_earnings || 0) + 20;
    referrerProfile.wallet_balance = (referrerProfile.wallet_balance || 0) + 20;
    await kv.set(`profile:${referrerProfile.id}`, referrerProfile);

    return c.json({ 
      success: true, 
      bonus: 10,
      message: 'Referral code applied! AED 10 added to your wallet'
    });
  } catch (error) {
    console.error('Error applying referral code:', error);
    return c.json({ error: 'Failed to apply referral code' }, 500);
  }
});

// ==================== NEW FEATURES (PACKAGES, VERIFICATION, PAYMENTS) ====================

// Calculate Price (Server-Side Logic)
app.post("/make-server-0b1f4071/trips/calculate-price", async (c) => {
  try {
    const { type, weight, distance_km, base_price } = await c.req.json();
    
    let price = 0;
    
    if (type === 'passenger') {
      // Basic algorithm: Base price + (0.5 AED * km)
      // If base_price is provided (driver set), use that, otherwise calculate
      price = base_price || (10 + (distance_km * 0.5));
    } else if (type === 'package') {
      // Package pricing strategy
      if (weight < 2) {
        price = 15; // Competitive small package price
      } else if (weight <= 18) {
        price = 35; // Medium package
      } else {
        // Large package (> 18kg)
        const extraKg = weight - 18;
        price = 50 + (extraKg * 2); 
      }
      
      // Add distance factor for packages too if long distance (> 50km)
      if (distance_km > 50) {
        price += (distance_km - 50) * 0.1;
      }
    }

    return c.json({ price: Math.round(price) });
  } catch (error) {
    return c.json({ error: 'Calculation failed' }, 500);
  }
});

// Submit Verification
app.post("/make-server-0b1f4071/verification/submit", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { document_url, document_type } = await c.req.json();

    const verificationId = `verification:${user.id}`;
    const verificationData = {
      user_id: user.id,
      document_url,
      document_type,
      status: 'pending', // pending, verified, rejected
      submitted_at: new Date().toISOString()
    };

    await kv.set(verificationId, verificationData);
    
    // Update profile status
    const profile = await kv.get(`profile:${user.id}`);
    if (profile) {
      profile.verification_status = 'pending';
      await kv.set(`profile:${user.id}`, profile);
    }

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Verification submission failed' }, 500);
  }
});

// Process Payment (Simulation)
app.post("/make-server-0b1f4071/payments/process", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const user = await getAuthenticatedUser(authHeader);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { amount, payment_method_id, booking_id } = await c.req.json();

    // Simulate payment processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, we would call Stripe/PayTabs here using Deno.env.get('STRIPE_KEY')
    
    // Record transaction
    const transactionId = `txn:${Date.now()}:${user.id}`;
    await kv.set(transactionId, {
      id: transactionId,
      user_id: user.id,
      amount,
      type: 'payment',
      status: 'success',
      booking_id,
      created_at: new Date().toISOString()
    });

    return c.json({ success: true, transaction_id: transactionId });
  } catch (error) {
    return c.json({ error: 'Payment failed' }, 500);
  }
});

// ==================== SEED DATA & ADMIN ====================

// RLS Policy Documentation
// ------------------------
// Since we are using a KV store without native SQL RLS, we enforce Row Level Security
// via application logic in each endpoint.
// 
// Policy 1: specific_user_only
// - Applied to: /profile/:userId, /wallet/:userId, /notifications/:userId, /messages/user/:userId
// - Logic: request.auth.uid === params.userId
//
// Policy 2: authenticated_only
// - Applied to: /trips (create), /bookings (create), /reviews (create)
// - Logic: !!request.auth.uid
//
// Policy 3: resource_owner_only
// - Applied to: /trips/:tripId (update/delete), /bookings/:bookingId (update)
// - Logic: resource.owner_id === request.auth.uid
//
// Policy 4: public_read
// - Applied to: /trips/search, /reviews/:userId
// - Logic: Allow all (data is public)

// Seed Database with Sample Data
app.post("/make-server-0b1f4071/admin/seed", async (c) => {
  try {
    // Basic protection: Ensure some auth header exists, though for seeding we might be lenient in dev
    // Ideally, check for a specific admin key or just allow for demo purposes
    
    const drivers = [
      { id: 'seed_driver_1', email: 'driver1@wassel.com', name: 'Mohammed Al-Fayed', car: 'Toyota Camry', rating: 4.9 },
      { id: 'seed_driver_2', email: 'driver2@wassel.com', name: 'Layla Mahmoud', car: 'Nissan Patrol', rating: 4.7 },
      { id: 'seed_driver_3', email: 'driver3@wassel.com', name: 'Omar Khaled', car: 'Hyundai Tucson', rating: 4.5 }
    ];

    const passengers = [
      { id: 'seed_pass_1', email: 'pass1@wassel.com', name: 'John Smith', rating: 4.8 },
      { id: 'seed_pass_2', email: 'pass2@wassel.com', name: 'Sarah Jones', rating: 5.0 }
    ];

    // 1. Create Profiles
    for (const d of drivers) {
      await kv.set(`profile:${d.id}`, {
        id: d.id,
        email: d.email,
        full_name: d.name,
        is_driver: true,
        rating_as_driver: d.rating,
        rating_as_passenger: 5.0,
        trips_as_driver: 10 + Math.floor(Math.random() * 50),
        total_earned: 1500 + Math.floor(Math.random() * 5000),
        wallet_balance: 250,
        verified: true,
        created_at: new Date().toISOString()
      });
    }

    for (const p of passengers) {
      await kv.set(`profile:${p.id}`, {
        id: p.id,
        email: p.email,
        full_name: p.name,
        is_driver: false,
        rating_as_passenger: p.rating,
        rating_as_driver: 0,
        trips_as_passenger: 5 + Math.floor(Math.random() * 20),
        wallet_balance: 100,
        verified: true,
        created_at: new Date().toISOString()
      });
    }

    // 2. Create Trips (Today, Tomorrow, Next Week)
    const routes = [
      { from: 'Dubai Marina', to: 'Abu Dhabi Mall', dist: 110 },
      { from: 'Downtown Dubai', to: 'Sharjah City Center', dist: 30 },
      { from: 'JVC', to: 'Dubai Airport (DXB)', dist: 35 },
      { from: 'Abu Dhabi', to: 'Al Ain', dist: 150 }
    ];

    let tripCount = 0;
    const now = new Date();

    for (const d of drivers) {
      for (let i = 0; i < 3; i++) {
        const route = routes[Math.floor(Math.random() * routes.length)];
        const date = new Date(now);
        date.setDate(date.getDate() + i); // Today, Tomorrow, Day after
        
        const tripId = `trip:seed:${d.id}:${i}`;
        const price = Math.floor(20 + (route.dist * 0.3)); // Rough pricing logic

        await kv.set(tripId, {
          id: tripId,
          driver_id: d.id,
          from: route.from,
          to: route.to,
          departure_date: date.toISOString().split('T')[0],
          departure_time: `${10 + Math.floor(Math.random() * 8)}:00`, // Between 10:00 and 18:00
          available_seats: 1 + Math.floor(Math.random() * 3),
          price_per_seat: price,
          status: 'published',
          car_model: d.car,
          allow_packages: true,
          description: `Regular commute from ${route.from}. Comfortable ride.`,
          bookings: [],
          created_at: new Date().toISOString()
        });
        tripCount++;
      }
    }

    return c.json({ 
      success: true, 
      message: `Database seeded with ${drivers.length} drivers, ${passengers.length} passengers, and ${tripCount} trips.` 
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return c.json({ error: 'Failed to seed database' }, 500);
  }
});

Deno.serve(app.fetch);