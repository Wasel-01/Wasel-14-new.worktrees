/**
 * Car Rentals Service - Flexible hourly/daily rentals with vehicle selection
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, Car, Clock, MapPin, Calendar, Users, Fuel, Settings, Shield, CreditCard, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ServiceTabs } from './ServiceTabs';
import { dataService } from '../services/mockDataService';

interface Vehicle {
  id: string;
  name: string;
  category: string;
  seats: number;
  transmission: string;
  fuel: string;
  image: string;
  hourlyRate: number;
  dailyRate: number;
  features: string[];
}

const vehicles: Vehicle[] = [
  {
    id: '1',
    name: 'Toyota Corolla',
    category: 'Economy',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Petrol',
    image: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a',
    hourlyRate: 25,
    dailyRate: 150,
    features: ['Bluetooth', 'AC', 'USB Charging']
  },
  {
    id: '2',
    name: 'Honda Accord',
    category: 'Comfort',
    seats: 5,
    transmission: 'Automatic',
    fuel: 'Hybrid',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588',
    hourlyRate: 35,
    dailyRate: 200,
    features: ['Leather Seats', 'Sunroof', 'Premium Audio', 'AC']
  },
  {
    id: '3',
    name: 'Range Rover Sport',
    category: 'Luxury',
    seats: 7,
    transmission: 'Automatic',
    fuel: 'Diesel',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b',
    hourlyRate: 85,
    dailyRate: 500,
    features: ['4WD', 'Massage Seats', 'Panoramic Roof', 'Premium Sound']
  },
  {
    id: '4',
    name: 'Mercedes Sprinter',
    category: 'Van',
    seats: 12,
    transmission: 'Automatic',
    fuel: 'Diesel',
    image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c',
    hourlyRate: 60,
    dailyRate: 350,
    features: ['Extra Space', 'AC', 'USB Ports', 'Sliding Doors']
  }
];

export function CarRentals() {
  const [rentalType, setRentalType] = useState<'hourly' | 'daily'>('daily');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [returnLocation, setReturnLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [hours, setHours] = useState('24');
  const [category, setCategory] = useState('all');

  const filteredVehicles = category === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.category.toLowerCase() === category);

  const calculatePrice = () => {
    if (!selectedVehicle) return 0;
    if (rentalType === 'hourly') {
      return selectedVehicle.hourlyRate * parseInt(hours || '0');
    }
    
    if (pickupDate && returnDate) {
      const pickup = new Date(pickupDate);
      const returnD = new Date(returnDate);
      const days = Math.ceil((returnD.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
      return selectedVehicle.dailyRate * Math.max(1, days);
    }
    return selectedVehicle.dailyRate;
  };

  const handleRental = async () => {
    if (!selectedVehicle || !pickupLocation || !pickupDate || !pickupTime) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      const rental = await dataService.createRental({
        vehicle_id: selectedVehicle.id,
        vehicle_name: selectedVehicle.name,
        pickup_location: pickupLocation,
        return_location: returnLocation || pickupLocation,
        pickup_date: pickupDate,
        return_date: returnDate || pickupDate,
        total_cost: calculatePrice(),
      });

      toast.success(`Rental confirmed! Total: AED ${calculatePrice()}. Confirmation sent to your email.`);
      
      // Reset form
      setSelectedVehicle(null);
      setPickupLocation('');
      setReturnLocation('');
      setPickupDate('');
      setPickupTime('');
      setReturnDate('');
      setReturnTime('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm rental');
    }
  };

  const mainServiceContent = (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 p-8 md:p-12 text-white"
      >
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1604445415362-2a9840bd5ff6"
            alt="Car rentals"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-xl px-6 py-3 rounded-full mb-6"
          >
            <Key className="w-6 h-6" />
            <span className="font-semibold">Car Rentals</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Rent Your Perfect Ride
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Flexible hourly and daily rentals. No hidden fees. Drive away in minutes.
          </p>
        </div>

        {/* 3D Animated Car */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -10, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-10 right-10 text-8xl opacity-30"
        >
          🚗
        </motion.div>
      </motion.div>

      {/* Rental Type Selection */}
      <Card className="border-2">
        <CardContent className="p-6">
          <Tabs value={rentalType} onValueChange={(v) => setRentalType(v as 'hourly' | 'daily')}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="hourly" className="text-base">
                <Clock className="w-4 h-4 mr-2" />
                Hourly
              </TabsTrigger>
              <TabsTrigger value="daily" className="text-base">
                <Calendar className="w-4 h-4 mr-2" />
                Daily
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Vehicle Category Filter */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {['all', 'economy', 'comfort', 'luxury', 'van'].map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? 'default' : 'outline'}
            onClick={() => setCategory(cat)}
            className="capitalize whitespace-nowrap"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredVehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 ${
                  selectedVehicle?.id === vehicle.id
                    ? 'ring-4 ring-indigo-500 shadow-2xl'
                    : 'hover:shadow-xl'
                }`}
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <ImageWithFallback
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 right-3 bg-indigo-600">
                    {vehicle.category}
                  </Badge>
                  {selectedVehicle?.id === vehicle.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 left-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {vehicle.seats}
                    </span>
                    <span className="flex items-center gap-1">
                      <Settings className="w-3 h-3" />
                      {vehicle.transmission}
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel className="w-3 h-3" />
                      {vehicle.fuel}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-bold text-indigo-600">
                      AED {rentalType === 'hourly' ? vehicle.hourlyRate : vehicle.dailyRate}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      /{rentalType === 'hourly' ? 'hour' : 'day'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {vehicle.features.slice(0, 2).map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Booking Form */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-2 border-indigo-200 dark:border-indigo-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-600" />
                  Complete Your Booking - {selectedVehicle.name}
                </CardTitle>
                <CardDescription>Fill in the rental details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pickup Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      Pickup Details
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pickup-location">Pickup Location *</Label>
                      <Input
                        id="pickup-location"
                        placeholder="Enter pickup address"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
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

                    {rentalType === 'hourly' && (
                      <div className="space-y-2">
                        <Label htmlFor="hours">Number of Hours</Label>
                        <Select value={hours} onValueChange={setHours}>
                          <SelectTrigger id="hours">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[3, 6, 12, 24, 48].map(h => (
                              <SelectItem key={h} value={h.toString()}>
                                {h} hours
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Return Details */}
                  {rentalType === 'daily' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        Return Details
                      </h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="return-location">Return Location</Label>
                        <Input
                          id="return-location"
                          placeholder="Same as pickup"
                          value={returnLocation}
                          onChange={(e) => setReturnLocation(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="return-date">Date</Label>
                          <Input
                            id="return-date"
                            type="date"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="return-time">Time</Label>
                          <Input
                            id="return-time"
                            type="time"
                            value={returnTime}
                            onChange={(e) => setReturnTime(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Total Cost</h3>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-indigo-600">
                        AED {calculatePrice()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {rentalType === 'hourly' ? `${hours} hours` : 'Daily rate'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <Shield className="w-4 h-4" />
                      <span>Insurance included</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                      <Fuel className="w-4 h-4" />
                      <span>Full tank provided</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                      <CreditCard className="w-4 h-4" />
                      <span>No hidden fees</span>
                    </div>
                  </div>
                </div>

                {/* Book Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleRental}
                    className="w-full h-14 text-lg bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-700 shadow-lg"
                  >
                    <Key className="w-5 h-5 mr-2" />
                    Confirm Rental - AED {calculatePrice()}
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
      mainServiceTitle="Car Rentals"
      mainServiceIcon={<Key className="w-4 h-4" />}
      showAllTabs={true}
    />
  );
}
