-- ============================================
-- WASSEL COMPLETE DATABASE SCHEMA
-- ============================================
-- Production-ready schema with all tables,
-- indexes, RLS policies, and triggers.
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES (Already Exist - Reference Only)
-- ============================================

-- profiles table exists
-- trips table exists
-- vehicles table exists
-- messages table exists
-- notifications table exists
-- promo_codes table exists

-- ============================================
-- NEW TABLES FOR COMPLETE FEATURES
-- ============================================

-- Live location tracking for real-time trips
CREATE TABLE IF NOT EXISTS live_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coordinates JSONB NOT NULL, -- {lat: number, lng: number}
  heading DECIMAL,
  speed DECIMAL,
  accuracy DECIMAL,
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_trip_user UNIQUE(trip_id, user_id)
);

CREATE INDEX idx_live_locations_trip ON live_locations(trip_id);
CREATE INDEX idx_live_locations_updated ON live_locations(updated_at DESC);

-- Emergency alerts
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location JSONB NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'active', -- active, resolved, false_alarm
  resolved_at TIMESTAMP,
  resolver_id UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX idx_emergency_alerts_created ON emergency_alerts(created_at DESC);

-- Disputes
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id),
  filed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- pricing, service, safety, lost_item, payment, other
  description TEXT NOT NULL,
  evidence JSONB, -- array of file URLs
  status TEXT DEFAULT 'open', -- open, under_review, resolved, closed
  resolution TEXT,
  admin_notes TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_filed_by ON disputes(filed_by);
CREATE INDEX idx_disputes_trip ON disputes(trip_id);

-- Driver earnings tracking
CREATE TABLE IF NOT EXISTS driver_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trips(id),
  total_fare DECIMAL NOT NULL,
  platform_fee DECIMAL NOT NULL,
  net_earnings DECIMAL NOT NULL,
  tips DECIMAL DEFAULT 0,
  bonuses DECIMAL DEFAULT 0,
  incentives DECIMAL DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, available, paid
  payout_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_driver_earnings_driver ON driver_earnings(driver_id);
CREATE INDEX idx_driver_earnings_status ON driver_earnings(status);
CREATE INDEX idx_driver_earnings_created ON driver_earnings(created_at DESC);

-- Payouts
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  method TEXT NOT NULL, -- bank_transfer, wallet
  status TEXT DEFAULT 'processing', -- processing, completed, failed
  transaction_id TEXT,
  bank_account TEXT, -- encrypted
  failure_reason TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payouts_driver ON payouts(driver_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_created ON payouts(created_at DESC);

-- Payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- card, wallet, bank
  stripe_payment_method_id TEXT,
  brand TEXT,
  last4 TEXT,
  expiry_month INTEGER,
  expiry_year INTEGER,
  holder_name TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  billing_address JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);
CREATE UNIQUE INDEX idx_payment_methods_default ON payment_methods(user_id) 
  WHERE is_default = TRUE;

-- Refunds
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  cancellation_fee DECIMAL DEFAULT 0,
  reason TEXT,
  payment_intent_id TEXT,
  refund_id TEXT,
  status TEXT DEFAULT 'pending', -- pending, processed, failed
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refunds_trip ON refunds(trip_id);
CREATE INDEX idx_refunds_user ON refunds(user_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- Trip insurance
CREATE TABLE IF NOT EXISTS trip_insurance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  policy_number TEXT UNIQUE,
  coverage_amount DECIMAL NOT NULL,
  premium DECIMAL NOT NULL,
  provider TEXT DEFAULT 'Wassel Insurance',
  status TEXT DEFAULT 'active', -- active, claimed, expired
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trip_insurance_trip ON trip_insurance(trip_id);
CREATE INDEX idx_trip_insurance_status ON trip_insurance(status);

-- Accident reports
CREATE TABLE IF NOT EXISTS accident_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id),
  reported_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  location JSONB,
  severity TEXT, -- minor, moderate, severe
  photos JSONB, -- array of URLs
  police_report_number TEXT,
  insurance_claim_id UUID,
  injuries BOOLEAN DEFAULT FALSE,
  vehicle_damage BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'reported', -- reported, investigating, resolved
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_accident_reports_trip ON accident_reports(trip_id);
CREATE INDEX idx_accident_reports_status ON accident_reports(status);

-- Scheduled trips
CREATE TABLE IF NOT EXISTS scheduled_trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  from_coordinates JSONB,
  to_coordinates JSONB,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  recurrence TEXT DEFAULT 'none', -- none, daily, weekly, monthly
  status TEXT DEFAULT 'scheduled', -- scheduled, matched, completed, cancelled
  matched_trip_id UUID REFERENCES trips(id),
  fare_estimate DECIMAL,
  vehicle_type TEXT DEFAULT 'standard',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scheduled_trips_user ON scheduled_trips(user_id);
CREATE INDEX idx_scheduled_trips_date ON scheduled_trips(scheduled_date);
CREATE INDEX idx_scheduled_trips_status ON scheduled_trips(status);

-- Fraud detection
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- fake_gps, multiple_accounts, payment_fraud, rating_manipulation
  severity TEXT NOT NULL, -- low, medium, high, critical
  description TEXT,
  evidence JSONB, -- array of evidence data
  confidence DECIMAL, -- 0-100
  status TEXT DEFAULT 'pending', -- pending, investigating, resolved, false_positive
  investigated_by UUID REFERENCES auth.users(id),
  resolution TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fraud_alerts_user ON fraud_alerts(user_id);
CREATE INDEX idx_fraud_alerts_severity ON fraud_alerts(severity);
CREATE INDEX idx_fraud_alerts_status ON fraud_alerts(status);

-- User ratings (detailed)
CREATE TABLE IF NOT EXISTS detailed_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  rated_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rated_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  overall DECIMAL NOT NULL CHECK (overall BETWEEN 1 AND 5),
  punctuality DECIMAL CHECK (punctuality BETWEEN 1 AND 5),
  cleanliness DECIMAL CHECK (cleanliness BETWEEN 1 AND 5),
  communication DECIMAL CHECK (communication BETWEEN 1 AND 5),
  driving DECIMAL CHECK (driving BETWEEN 1 AND 5),
  badges JSONB, -- array of badge names
  safety_issues BOOLEAN DEFAULT FALSE,
  safety_report TEXT,
  comment TEXT,
  photos JSONB, -- array of photo URLs
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_detailed_ratings_trip ON detailed_ratings(trip_id);
CREATE INDEX idx_detailed_ratings_rated_user ON detailed_ratings(rated_user_id);

-- Lost items
CREATE TABLE IF NOT EXISTS lost_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id),
  reported_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_description TEXT NOT NULL,
  item_photo TEXT,
  location_left TEXT,
  status TEXT DEFAULT 'reported', -- reported, found, returned, closed
  found_by UUID REFERENCES auth.users(id),
  return_arranged BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lost_items_trip ON lost_items(trip_id);
CREATE INDEX idx_lost_items_status ON lost_items(status);

-- System audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE live_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE accident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE detailed_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_items ENABLE ROW LEVEL SECURITY;

-- Live locations: Users can see their trip's locations
CREATE POLICY "Users can view trip locations" ON live_locations
  FOR SELECT USING (
    trip_id IN (
      SELECT id FROM trips WHERE passenger_id = auth.uid() OR driver_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their location" ON live_locations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their location data" ON live_locations
  FOR UPDATE USING (user_id = auth.uid());

-- Emergency alerts: Users can create and view their alerts
CREATE POLICY "Users can create emergency alerts" ON emergency_alerts
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their alerts" ON emergency_alerts
  FOR SELECT USING (user_id = auth.uid());

-- Disputes: Users can create and view their disputes
CREATE POLICY "Users can file disputes" ON disputes
  FOR INSERT WITH CHECK (filed_by = auth.uid());

CREATE POLICY "Users can view their disputes" ON disputes
  FOR SELECT USING (filed_by = auth.uid());

-- Driver earnings: Drivers can view their earnings
CREATE POLICY "Drivers can view their earnings" ON driver_earnings
  FOR SELECT USING (driver_id = auth.uid());

-- Payouts: Drivers can view their payouts
CREATE POLICY "Drivers can view their payouts" ON payouts
  FOR SELECT USING (driver_id = auth.uid());

-- Payment methods: Users can manage their payment methods
CREATE POLICY "Users can manage payment methods" ON payment_methods
  FOR ALL USING (user_id = auth.uid());

-- Refunds: Users can view their refunds
CREATE POLICY "Users can view refunds" ON refunds
  FOR SELECT USING (user_id = auth.uid());

-- Scheduled trips: Users can manage their scheduled trips
CREATE POLICY "Users can manage scheduled trips" ON scheduled_trips
  FOR ALL USING (user_id = auth.uid());

-- Detailed ratings: Users can view ratings about them
CREATE POLICY "Users can view their ratings" ON detailed_ratings
  FOR SELECT USING (rated_user_id = auth.uid() OR rated_by = auth.uid());

CREATE POLICY "Users can create ratings" ON detailed_ratings
  FOR INSERT WITH CHECK (rated_by = auth.uid());

-- Lost items: Users can manage lost items
CREATE POLICY "Users can report lost items" ON lost_items
  FOR INSERT WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Users can view lost items" ON lost_items
  FOR SELECT USING (
    reported_by = auth.uid() OR 
    trip_id IN (SELECT id FROM trips WHERE driver_id = auth.uid())
  );

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Update trip earnings when trip completes
CREATE OR REPLACE FUNCTION calculate_driver_earnings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO driver_earnings (
      driver_id,
      trip_id,
      total_fare,
      platform_fee,
      net_earnings,
      tips,
      status
    ) VALUES (
      NEW.driver_id,
      NEW.id,
      NEW.fare,
      NEW.fare * 0.20, -- 20% platform fee
      NEW.fare * 0.80, -- 80% to driver
      0,
      'available'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_earnings
  AFTER UPDATE ON trips
  FOR EACH ROW
  EXECUTE FUNCTION calculate_driver_earnings();

-- Update average rating when new rating added
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET rating = (
    SELECT AVG(overall)
    FROM detailed_ratings
    WHERE rated_user_id = NEW.rated_user_id
  )
  WHERE id = NEW.rated_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating
  AFTER INSERT ON detailed_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- Cleanup old live locations (keep last 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_locations()
RETURNS void AS $$
BEGIN
  DELETE FROM live_locations
  WHERE updated_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-locations', '0 * * * *', 'SELECT cleanup_old_locations()');

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Driver performance view
CREATE OR REPLACE VIEW driver_performance AS
SELECT
  p.id as driver_id,
  p.full_name,
  p.rating,
  COUNT(t.id) as total_trips,
  SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_trips,
  SUM(CASE WHEN t.status = 'cancelled' AND t.cancelled_by = p.id THEN 1 ELSE 0 END) as cancelled_trips,
  COALESCE(SUM(de.net_earnings), 0) as total_earnings,
  COALESCE(SUM(de.tips), 0) as total_tips
FROM profiles p
LEFT JOIN trips t ON t.driver_id = p.id
LEFT JOIN driver_earnings de ON de.driver_id = p.id
WHERE p.role = 'driver'
GROUP BY p.id, p.full_name, p.rating;

-- Revenue analytics view
CREATE OR REPLACE VIEW revenue_analytics AS
SELECT
  DATE(t.created_at) as date,
  COUNT(*) as total_trips,
  SUM(t.fare) as gross_revenue,
  SUM(de.platform_fee) as platform_revenue,
  SUM(de.net_earnings) as driver_payouts,
  SUM(de.tips) as total_tips
FROM trips t
LEFT JOIN driver_earnings de ON de.trip_id = t.id
WHERE t.status = 'completed'
GROUP BY DATE(t.created_at)
ORDER BY date DESC;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trips_driver_status ON trips(driver_id, status);
CREATE INDEX IF NOT EXISTS idx_trips_passenger_status ON trips(passenger_id, status);
CREATE INDEX IF NOT EXISTS idx_trips_created_status ON trips(created_at DESC, status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);

-- JSONB indexes for location queries
CREATE INDEX IF NOT EXISTS idx_live_locations_coordinates ON live_locations USING GIN (coordinates);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_location ON emergency_alerts USING GIN (location);

-- ============================================
-- DATA INITIALIZATION
-- ============================================

-- Insert default system user for automated actions
-- INSERT INTO auth.users (id, email) VALUES 
--   ('00000000-0000-0000-0000-000000000000', 'system@wassel.com')
-- ON CONFLICT DO NOTHING;

-- ============================================
-- COMPLETION
-- ============================================
-- Schema setup complete!
-- Remember to:
-- 1. Run this on production Supabase instance
-- 2. Set up backup schedule
-- 3. Configure pg_cron for automated cleanups
-- 4. Monitor index usage and optimize as needed
-- ============================================
