/**
 * Shuttle Service - Group transport with route planning
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Bus, MapPin, Clock, Users, Calendar, Route, Building, Ticket, CheckCircle2, Navigation } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ServiceTabs } from './ServiceTabs';
import { dataService } from '../services/mockDataService';

interface ShuttleRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  stops: number;
  duration: string;
  frequency: string;
  price: number;
  category: string;
}

const routes: ShuttleRoute[] = [
  {
    id: '1',
    name: 'Dubai Marina → Downtown',
    from: 'Dubai Marina',
    to: 'Downtown Dubai',
    stops: 5,
    duration: '35 min',
    frequency: 'Every 15 min',
    price: 15,
    category: 'city'
  },
  {
    id: '2',
    name: 'Dubai → Abu Dhabi',
    from: 'Dubai',
    to: 'Abu Dhabi',
    stops: 8,
    duration: '90 min',
    frequency: 'Every 30 min',
    price: 45,
    category: 'intercity'
  },
  {
    id: '3',
    name: 'Airport Express',
    from: 'DXB Airport',
    to: 'City Center',
    stops: 3,
    duration: '25 min',
    frequency: 'Every 20 min',
    price: 25,
    category: 'airport'
  },
  {
    id: '4',
    name: 'Beach Circuit',
    from: 'JBR',
    to: 'Kite Beach',
    stops: 6,
    duration: '40 min',
    frequency: 'Every 45 min',
    price: 10,
    category: 'tourist'
  }
];

export function ShuttleService() {
  const [selectedRoute, setSelectedRoute] = useState<ShuttleRoute | null>(null);
  const [passengers, setPassengers] = useState('1');
  const [travelDate, setTravelDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [pickupStop, setPickupStop] = useState('');
  const [dropoffStop, setDropoffStop] = useState('');
  const [category, setCategory] = useState('all');

  const filteredRoutes = category === 'all'
    ? routes
    : routes.filter(r => r.category === category);

  const calculateTotal = () => {
    if (!selectedRoute) return 0;
    return selectedRoute.price * parseInt(passengers || '1');
  };

  const handleBooking = async () => {
    if (!selectedRoute || !travelDate || !departureTime || !pickupStop || !dropoffStop) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      const booking = await dataService.createBooking(
        selectedRoute.id,
        parseInt(passengers),
        pickupStop,
        dropoffStop
      );

      toast.success(`Shuttle booked! Total: AED ${calculateTotal()}. E-ticket sent to your email.`);
      
      // Reset form
      setSelectedRoute(null);
      setTravelDate('');
      setDepartureTime('');
      setPickupStop('');
      setDropoffStop('');
      setPassengers('1');
    } catch (error: any) {
      toast.error(error.message || 'Failed to book shuttle');
    }
  };

  const mainServiceContent = (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8 md:p-12 text-white"
      >
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1764776401208-18c289c9c80c"
            alt="Shuttle service"
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
            <Bus className="w-6 h-6" />
            <span className="font-semibold">Shuttle Service</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Comfortable Group Transport
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Fixed routes, scheduled departures, and affordable group travel across the city and beyond.
          </p>
        </div>

        {/* 3D Animated Bus */}
        <motion.div
          animate={{
            x: [-100, 0, -100],
            y: [0, -5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-0 text-8xl opacity-30"
        >
          🚌
        </motion.div>
      </motion.div>

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Route, label: 'Fixed Routes', desc: 'Predictable schedules' },
          { icon: Clock, label: 'On Time', desc: 'Reliable departures' },
          { icon: Users, label: 'Group Travel', desc: 'Save together' },
          { icon: Ticket, label: 'E-Tickets', desc: 'Digital boarding' }
        ].map((feature, index) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.05 }}
          >
            <Card className="border-2 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4 text-center">
                <feature.icon className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
                <p className="font-semibold text-sm mb-1">{feature.label}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All Routes', icon: Bus },
          { id: 'city', label: 'City', icon: Building },
          { id: 'intercity', label: 'Intercity', icon: Route },
          { id: 'airport', label: 'Airport', icon: Navigation }
        ].map((cat) => (
          <Button
            key={cat.id}
            variant={category === cat.id ? 'default' : 'outline'}
            onClick={() => setCategory(cat.id)}
            className="whitespace-nowrap"
          >
            <cat.icon className="w-4 h-4 mr-2" />
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Route Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRoutes.map((route, index) => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-300 ${
                selectedRoute?.id === route.id
                  ? 'ring-4 ring-indigo-500 shadow-2xl'
                  : 'hover:shadow-xl'
              }`}
              onClick={() => setSelectedRoute(route)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 flex items-center gap-2">
                      {selectedRoute?.id === route.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                      {route.name}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>{route.from}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span>{route.to}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge className="capitalize bg-indigo-600">{route.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{route.stops}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Stops</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{route.duration}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">AED {route.price}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Per person</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Departs {route.frequency}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Booking Form */}
      {selectedRoute && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-indigo-600" />
                Book Tickets - {selectedRoute.name}
              </CardTitle>
              <CardDescription>Complete your shuttle booking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="passengers">Number of Passengers</Label>
                    <Select value={passengers} onValueChange={setPassengers}>
                      <SelectTrigger id="passengers">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} {num === 1 ? 'Passenger' : 'Passengers'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="travel-date">Travel Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="travel-date"
                        type="date"
                        value={travelDate}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departure-time">Preferred Departure Time *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="departure-time"
                        type="time"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Shuttles depart {selectedRoute.frequency}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickup-stop">Pickup Stop *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="pickup-stop"
                        placeholder={`Stop along ${selectedRoute.from}`}
                        value={pickupStop}
                        onChange={(e) => setPickupStop(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dropoff-stop">Drop-off Stop *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        id="dropoff-stop"
                        placeholder={`Stop along ${selectedRoute.to}`}
                        value={dropoffStop}
                        onChange={(e) => setDropoffStop(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-4 border-2 border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Total Cost</span>
                      <span className="text-3xl font-bold text-indigo-600">
                        AED {calculateTotal()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {passengers} passenger(s) × AED {selectedRoute.price}
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Route className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <div className="text-sm font-semibold">{selectedRoute.stops} Stops</div>
                  </div>
                  <div>
                    <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <div className="text-sm font-semibold">{selectedRoute.duration}</div>
                  </div>
                  <div>
                    <Bus className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <div className="text-sm font-semibold">{selectedRoute.frequency}</div>
                  </div>
                </div>
              </div>

              {/* Book Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleBooking}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 hover:from-blue-700 hover:via-indigo-800 hover:to-purple-900 shadow-lg"
                >
                  <Ticket className="w-5 h-5 mr-2" />
                  Book Shuttle - AED {calculateTotal()}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );

  return (
    <ServiceTabs
      mainService={mainServiceContent}
      mainServiceTitle="Shuttle Service"
      mainServiceIcon={<Bus className="w-4 h-4" />}
      showAllTabs={true}
    />
  );
}
