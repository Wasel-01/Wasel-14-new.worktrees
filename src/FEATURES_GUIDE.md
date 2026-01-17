# 🚀 Wassel Features Guide

## Complete Service Breakdown

### 1. 📦 Delivery Service
**Component**: `PackageDelivery.tsx`  
**Route**: `package-delivery`

**Features:**
- Package size selection (Small, Medium, Large, Extra Large)
- Real-time tracking
- Insurance options
- Express delivery
- Proof of delivery
- Multiple pickup/dropoff addresses

**Use Cases:**
- Document delivery
- Small parcels
- Gift delivery
- E-commerce shipments

---

### 2. 🛴 Scooter Rentals
**Component**: `ScooterRentals.tsx`  
**Route**: `scooters`

**Features:**
- Interactive map with scooter locations
- Battery level indicator
- QR code unlock simulation
- Per-minute pricing
- Real-time availability
- Eco-friendly last-mile transport

**Use Cases:**
- Short city trips
- Last-mile connectivity
- Quick errands
- Campus transportation

---

### 3. 🚚 Freight Shipping
**Component**: `FreightShipping.tsx`  
**Route**: `freight`

**Features:**
- Weight and volume calculator
- Multiple vehicle types (Van, Truck, Lorry)
- Cargo type specification
- Loading assistance options
- Commercial shipping
- Insurance coverage

**Use Cases:**
- Business shipments
- Heavy cargo
- Furniture moving
- Equipment transport

---

### 4. 👥 Carpool
**Component**: `FindRide.tsx`  
**Route**: `carpool`

**Features:**
- Shared ride matching
- Cost splitting
- Route optimization
- Multiple passenger booking
- Rating system
- Environmental impact tracking

**Use Cases:**
- Daily commute
- Long-distance travel
- Event transportation
- Cost-effective travel

---

### 5. 🐾 Pet Transport
**Component**: `PetTransport.tsx`  
**Route**: `pets`

**Features:**
- Pet information (species, breed, weight)
- Carrier specifications
- Temperature control
- Multiple pet booking
- Special care requirements
- Veterinary documentation

**Use Cases:**
- Vet appointments
- Pet relocation
- Grooming visits
- Airport pet transport

---

### 6. 🎒 School Transport (NEW)
**Component**: `SchoolTransport.tsx`  
**Route**: `school`

**Features:**
- Guardian verification system
- Multiple student management
- Daily/weekly schedules
- Background-checked drivers
- Real-time parent notifications
- Attendance tracking
- Safety alerts

**Premium Features:**
- In-vehicle cameras (optional)
- SMS notifications to all guardians
- Daily attendance reports
- Emergency contact system

**Use Cases:**
- Daily school commute
- After-school activities
- Field trips
- Sports team transport

---

### 7. 🏥 Medical Transport (NEW)
**Component**: `MedicalTransport.tsx`  
**Route**: `medical`

**Features:**
- Appointment type selection
- Wheelchair accessibility
- First aid trained drivers
- Wait-and-return service
- Medical equipment accommodation
- Emergency contact system
- Non-emergency transport

**Accessibility Options:**
- Wheelchair accessible vehicles
- Oxygen support
- Stretcher capability
- Companion allowed
- Medical equipment space

**Use Cases:**
- Doctor appointments
- Dialysis trips
- Chemotherapy sessions
- Physical therapy
- Lab tests
- Elderly care transport

---

### 8. 🔑 Car Rentals (NEW)
**Component**: `CarRentals.tsx`  
**Route**: `car-rentals`

**Features:**
- Hourly and daily rentals
- Multiple vehicle categories
- Real-time availability
- Insurance included
- Full tank provided
- Flexible pickup/return
- No hidden fees

**Vehicle Categories:**
- **Economy**: Toyota Corolla (AED 25/hr, AED 150/day)
- **Comfort**: Honda Accord Hybrid (AED 35/hr, AED 200/day)
- **Luxury**: Range Rover Sport (AED 85/hr, AED 500/day)
- **Van**: Mercedes Sprinter (AED 60/hr, AED 350/day)

**Use Cases:**
- Business meetings
- Weekend trips
- Family outings
- Airport transfers

---

### 9. 🚌 Shuttle Service (NEW)
**Component**: `ShuttleService.tsx`  
**Route**: `shuttle`

**Features:**
- Fixed route scheduling
- Multiple route types
- Group booking discounts
- E-ticket system
- Multiple stops
- Predictable departures

**Route Types:**
- **City**: Short urban routes (e.g., Dubai Marina → Downtown)
- **Intercity**: Long-distance (e.g., Dubai → Abu Dhabi)
- **Airport**: Express airport transfers
- **Tourist**: Scenic routes

**Use Cases:**
- Airport commute
- Intercity travel
- Group events
- Tourist circuits

---

### 10. 👑 Luxury Rides (NEW)
**Component**: `LuxuryRides.tsx`  
**Route**: `luxury`

**Features:**
- Premium vehicle fleet
- Professional chauffeur service
- Premium amenities
- Occasion packages
- 24/7 concierge support
- Red carpet service

**Vehicle Fleet:**
- **Mercedes S-Class**: AED 150/hr
- **Rolls-Royce Phantom**: AED 350/hr
- **Bentley Bentayga**: AED 250/hr
- **Bentley Flying Spur**: AED 280/hr

**Premium Amenities (+AED 50 each):**
- Champagne service
- Fresh flowers
- Curated playlist
- Red carpet service
- Meet & greet
- Concierge support

**Use Cases:**
- Weddings
- Business VIP transport
- Special celebrations
- Airport luxury transfers

---

## Premium Features

### 🎯 AR Navigation
**Component**: `ARNavigation.tsx`  
**Access**: Automatic during active trips

**Features:**
- Real camera feed integration
- Device orientation tracking
- GPS-based distance calculation
- 8-way directional arrows
- Distance indicator
- Live compass
- AR markers for pickup points

**Requirements:**
- Camera permission
- Location permission
- Gyroscope support

---

### 🎙️ Voice Assistant
**Component**: `VoiceAssistant.tsx`  
**Access**: Always available (bottom-right icon)

**Commands:**
- "Book a ride to [location]"
- "Where is my driver?"
- "Cancel my trip"
- "Show my trips"
- "Call driver"

**Languages:**
- English
- Arabic (العربية)

---

### 🌟 3D Animations

**Landing Page:**
- Floating gradient orbs with rotation
- Particle systems (30+ particles)
- Parallax scrolling effects
- Smooth page transitions

**Service Cards:**
- 3D rotate on hover
- Shimmer sweep effect
- Icon wobble animation
- Glow shadows
- Scale transformations

**Splash Screen:**
- Multi-layer background orbs
- Rotating logo with glow pulse
- Depth-based particles
- Progress bar animation

**Dashboard:**
- Stats cards with gradient backgrounds
- Service icons with hover rotations
- Glassmorphic panels
- Floating action button

---

## Navigation Guide

### Main Routes
```
/                    → Landing Page
/dashboard           → Enhanced Dashboard
/find-ride           → Book a ride
/package-delivery    → Delivery service
/scooters           → Scooter rentals
/freight            → Freight shipping
/carpool            → Carpool service
/pets               → Pet transport
/school             → School transport
/medical            → Medical transport
/car-rentals        → Car rentals
/shuttle            → Shuttle service
/luxury             → Luxury rides
```

### User Management
```
/profile            → User profile
/settings           → App settings
/payment-methods    → Payment management
/my-trips           → Trip history
/scheduled-trips    → Future trips
/analytics          → Trip analytics
```

### Advanced Features
```
/ride-social        → Social features
/safety             → Safety center
/verification       → ID verification
/referrals          → Referral program
/business           → Business accounts
```

### Admin (Restricted)
```
/admin-dashboard    → Admin overview
/dispute-center     → Dispute management
```

---

## Booking Flow

### Standard Ride Booking
1. Click "Book Ride" or FAB button
2. Enter pickup location
3. Enter destination
4. Select date/time
5. Choose service type
6. Review fare estimate
7. Confirm booking
8. Track driver in real-time

### Service-Specific Flows

**School Transport:**
1. Add student details
2. Add guardian contacts
3. Set pickup/school addresses
4. Select days of week
5. Set pickup/return times
6. Confirm schedule

**Medical Transport:**
1. Enter patient information
2. Select appointment type
3. Add emergency contact
4. Select accessibility needs
5. Choose wait-and-return option
6. Confirm booking

**Car Rentals:**
1. Select rental type (hourly/daily)
2. Choose vehicle category
3. Pick a vehicle
4. Set pickup location/time
5. Set return details
6. Review total cost
7. Confirm rental

**Luxury Rides:**
1. Select premium vehicle
2. Enter journey details
3. Choose occasion type
4. Select amenities
5. Add special requests
6. Review luxury package
7. Confirm booking

---

## Key Interactions

### Floating Action Button (FAB)
- **Location**: Bottom-right corner
- **Actions**:
  - Book Ride
  - Book Delivery
  - Schedule Trip
  - Corporate Booking

### Voice Assistant
- **Activation**: Click microphone icon
- **Hold to speak**
- **Release to process**
- **Visual feedback** during listening

### AR Navigation
- **Activation**: Opens during trip start
- **Permissions**: Camera + Location required
- **Live tracking** with AR overlays
- **Close**: X button top-right

---

## Tips & Tricks

### Maximize Savings
1. Use **Carpool** for daily commute (up to 70% savings)
2. Book **Shuttle** for fixed routes
3. Use **Raje3** (return trips) for better rates
4. Refer friends for ride credits

### Best Practices
1. **Recurring trips**: Set up for regular commutes
2. **Scheduled trips**: Book in advance for better prices
3. **Split payment**: Share costs with co-passengers
4. **Favorites**: Save frequent locations
5. **Rating**: Rate drivers for better matches

### Safety Features
1. Share live trip with contacts
2. Emergency SOS button
3. Driver verification
4. In-app chat (no phone numbers shared)
5. Trip recording

---

## Support & Help

### In-App Help
- Help Center: `/help`
- Safety Center: `/safety`
- Dispute Resolution: `/dispute-center`

### Contact Methods
- Live chat (bottom-right)
- Voice assistant
- Email support
- Phone hotline

### Emergency
- **SOS Button**: Always visible during trips
- **Emergency Contacts**: Auto-notification
- **Live Tracking**: Shared with authorities if needed

---

## Coming Soon 🚀

### Planned Enhancements
- [ ] Live video call with driver
- [ ] In-app navigation for drivers
- [ ] Multi-stop routing
- [ ] Carbon offset purchase
- [ ] Subscription plans
- [ ] Corporate API

### Regional Expansion
- [ ] Saudi Arabia full coverage
- [ ] UAE expansion
- [ ] Egypt launch
- [ ] Jordan market entry

---

*This guide covers all features available in Wassel v2.0.0*  
*Last Updated: January 6, 2026*
