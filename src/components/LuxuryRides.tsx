/**
 * Luxury Rides - Premium chauffeur service with high-end vehicle selection
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Car, MapPin, Clock, Star, Shield, Sparkles, Wine, Music, Phone, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ServiceTabs } from './ServiceTabs';
import { dataService } from '../services/mockDataService';

interface LuxuryVehicle {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  hourlyRate: number;
  features: string[];
  color: string;
}

const vehicles: LuxuryVehicle[] = [
  {
    id: '1',
    name: 'S-Class',
    brand: 'Mercedes-Benz',
    category: 'Executive',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935',
    hourlyRate: 150,
    features: ['Massage Seats', 'Champagne Bar', 'Privacy Glass', 'Premium Audio'],
    color: 'from-slate-700 to-gray-900'
  },
  {
    id: '2',
    name: 'Phantom',
    brand: 'Rolls-Royce',
    category: 'Ultra Luxury',
    image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4',
    hourlyRate: 350,
    features: ['Starlight Headliner', 'Champagne Cooler', 'Lambswool Carpets', 'Bespoke Audio'],
    color: 'from-amber-600 to-yellow-700'
  },
  {
    id: '3',
    name: 'Bentayga',
    brand: 'Bentley',
    category: 'Luxury SUV',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341',
    hourlyRate: 250,
    features: ['Panoramic Roof', 'Refrigerator', 'WiFi', 'Mood Lighting'],
    color: 'from-emerald-700 to-teal-900'
  },
  {
    id: '4',
    name: 'Flying Spur',
    brand: 'Bentley',
    category: 'Luxury Sedan',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6',
    hourlyRate: 280,
    features: ['Rotating Display', 'Massage Seats', 'Ambient Lighting', 'Premium Sound'],
    color: 'from-blue-800 to-indigo-900'
  }
];

const amenities = [
  { id: 'champagne', label: 'Champagne Service', icon: Wine },
  { id: 'flowers', label: 'Fresh Flowers', icon: Sparkles },
  { id: 'music', label: 'Curated Playlist', icon: Music },
  { id: 'red-carpet', label: 'Red Carpet Service', icon: Star },
  { id: 'meet-greet', label: 'Meet & Greet', icon: Shield },
  { id: 'concierge', label: 'Concierge Support', icon: Phone }
];

export function LuxuryRides() {
  const [selectedVehicle, setSelectedVehicle] = useState<LuxuryVehicle | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [duration, setDuration] = useState('3');
  const [occasion, setOccasion] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState('');

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    if (!selectedVehicle) return 0;
    const basePrice = selectedVehicle.hourlyRate * parseInt(duration);
    const amenitiesPrice = selectedAmenities.length * 50;
    return basePrice + amenitiesPrice;
  };

  const handleBooking = async () => {
    if (!selectedVehicle || !pickupLocation || !destination || !pickupDate || !pickupTime) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      const rental = await dataService.createRental({
        vehicle_id: selectedVehicle.id,
        vehicle_name: `${selectedVehicle.brand} ${selectedVehicle.name}`,
        pickup_location: pickupLocation,
        return_location: destination,
        pickup_date: pickupDate,
        return_date: pickupDate, // Same day for luxury rides
        total_cost: calculateTotal(),
      });

      toast.success(`Luxury ride booked! Total: AED ${calculateTotal()}. Chauffeur will arrive 10 minutes early.`);
      
      // Reset form
      setSelectedVehicle(null);
      setPickupLocation('');
      setDestination('');
      setPickupDate('');
      setPickupTime('');
      setDuration('2');
      setSelectedAmenities([]);
      setSpecialRequests('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to book luxury ride');
    }
  };

  const mainServiceContent = (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-yellow-600 to-orange-700 p-8 md:p-12 text-white"
      >
        <div className="absolute inset-0 opacity-30">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1764090317825-9b76e437c8d8"
            alt="Luxury cars"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Animated golden particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
        
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-xl px-6 py-3 rounded-full mb-6 border-2 border-white/30"
          >
            <Crown className="w-6 h-6" />
            <span className="font-semibold">Luxury Chauffeur Service</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Arrive in Absolute Style
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Experience the pinnacle of luxury travel with our fleet of premium vehicles and professional chauffeurs.
          </p>
        </div>

        {/* 3D Animated Crown */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-10 right-10 text-9xl opacity-30"
        >
          👑
        </motion.div>
      </motion.div>

      {/* Premium Features */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: Star, label: '5-Star Service', color: 'text-yellow-600' },
          { icon: Shield, label: 'Insured & Licensed', color: 'text-blue-600' },
          { icon: Crown, label: 'Elite Chauffeurs', color: 'text-purple-600' },
          { icon: Sparkles, label: 'Pristine Vehicles', color: 'text-pink-600' },
          { icon: Phone, label: '24/7 Concierge', color: 'text-green-600' }
        ].map((feature, index) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.05 }}
          >
            <Card className="border-2 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <CardContent className="p-4 text-center">
                <feature.icon className={`w-8 h-8 mx-auto mb-2 ${feature.color}`} />
                <p className="text-xs font-semibold">{feature.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Vehicle Selection */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Car className="w-6 h-6 text-amber-600" />
          Select Your Vehicle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.03 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                  selectedVehicle?.id === vehicle.id
                    ? 'ring-4 ring-amber-500 shadow-2xl'
                    : 'hover:shadow-2xl'
                }`}
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${vehicle.color} opacity-40`} />
                  <Badge className="absolute top-3 right-3 bg-amber-600 text-white border-0">
                    {vehicle.category}
                  </Badge>
                  {selectedVehicle?.id === vehicle.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 left-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <CheckCircle className="w-6 h-6 text-white" />
                    </motion.div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span className="text-xs">{vehicle.brand}</span>
                  </div>
                  <CardTitle className="text-xl">{vehicle.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-amber-600">AED {vehicle.hourlyRate}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">/hour</span>
                  </div>
                  <div className="space-y-1">
                    {vehicle.features.slice(0, 3).map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Booking Form */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Crown className="w-6 h-6 text-amber-600" />
                  Complete Your Luxury Booking
                </CardTitle>
                <CardDescription>
                  {selectedVehicle.brand} {selectedVehicle.name} - {selectedVehicle.category}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Trip Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-amber-600" />
                      Journey Details
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pickup">Pickup Location *</Label>
                      <Input
                        id="pickup"
                        placeholder="Enter pickup address"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination</Label>
                      <Input
                        id="destination"
                        placeholder="Where would you like to go?"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="pickup-date">Date *</Label>
                        <Input
                          id="pickup-date"
                          type="date"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup-time">Time *</Label>
                        <Input
                          id="pickup-time"
                          type="time"
                          value={pickupTime}
                          onChange={(e) => setPickupTime(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (hours)</Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger id="duration">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[3, 4, 6, 8, 12, 24].map(h => (
                            <SelectItem key={h} value={h.toString()}>
                              {h} hours
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="occasion">Occasion (Optional)</Label>
                      <Select value={occasion} onValueChange={setOccasion}>
                        <SelectTrigger id="occasion">
                          <SelectValue placeholder="Select occasion" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business">Business Meeting</SelectItem>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="airport">Airport Transfer</SelectItem>
                          <SelectItem value="celebration">Celebration</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Amenities & Requests */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      Premium Amenities
                    </h3>
                    
                    <div className="space-y-2">
                      {amenities.map(amenity => (
                        <motion.div
                          key={amenity.id}
                          whileHover={{ x: 5 }}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer"
                          onClick={() => toggleAmenity(amenity.id)}
                        >
                          <Checkbox
                            id={amenity.id}
                            checked={selectedAmenities.includes(amenity.id)}
                            onCheckedChange={() => toggleAmenity(amenity.id)}
                          />
                          <amenity.icon className="w-5 h-5 text-amber-600" />
                          <label htmlFor={amenity.id} className="flex-1 text-sm font-medium cursor-pointer">
                            {amenity.label}
                          </label>
                          <span className="text-xs text-gray-600 dark:text-gray-400">+AED 50</span>
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="requests">Special Requests</Label>
                      <Textarea
                        id="requests"
                        placeholder="Any specific requirements or preferences..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border-2 border-amber-300 dark:border-amber-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Total Investment</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {duration} hours • {selectedAmenities.length} amenities
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                        AED {calculateTotal()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm border-t border-amber-200 dark:border-amber-800 pt-4">
                    <div className="flex justify-between">
                      <span>Vehicle rental ({duration}h)</span>
                      <span className="font-semibold">AED {selectedVehicle.hourlyRate * parseInt(duration)}</span>
                    </div>
                    {selectedAmenities.length > 0 && (
                      <div className="flex justify-between">
                        <span>Premium amenities ({selectedAmenities.length})</span>
                        <span className="font-semibold">AED {selectedAmenities.length * 50}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Book Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleBooking}
                    className="w-full h-16 text-lg bg-gradient-to-r from-amber-500 via-yellow-600 to-orange-700 hover:from-amber-600 hover:via-yellow-700 hover:to-orange-800 shadow-2xl text-white border-0"
                  >
                    <Crown className="w-6 h-6 mr-2" />
                    Confirm Luxury Booking - AED {calculateTotal()}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <ServiceTabs
      mainService={mainServiceContent}
      mainServiceTitle="Luxury Rides"
      mainServiceIcon={<Crown className="w-4 h-4" />}
      showAllTabs={true}
    />
  );
}
