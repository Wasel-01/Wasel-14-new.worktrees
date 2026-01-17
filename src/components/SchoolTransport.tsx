/**
 * School Transport Service - Safe student commute with guardian verification
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { School, MapPin, Clock, Shield, Users, Calendar, Bell, CheckCircle, AlertCircle, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ServiceTabs } from './ServiceTabs';
import { dataService } from '../services/mockDataService';

interface Guardian {
  name: string;
  relationship: string;
  phone: string;
}

interface Student {
  name: string;
  age: string;
  grade: string;
  guardians: Guardian[];
}

export function SchoolTransport() {
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('round-trip');
  const [students, setStudents] = useState<Student[]>([]);
  const [pickupLocation, setPickupLocation] = useState('');
  const [schoolLocation, setSchoolLocation] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Partial<Student>>({
    guardians: []
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const addStudent = () => {
    if (currentStudent.name && currentStudent.age && currentStudent.grade) {
      setStudents([...students, currentStudent as Student]);
      setCurrentStudent({ guardians: [] });
      toast.success('Student added successfully');
    } else {
      toast.error('Please fill in all student details');
    }
  };

  const addGuardian = () => {
    if (currentStudent.guardians) {
      const newGuardian = { name: '', relationship: '', phone: '' };
      setCurrentStudent({
        ...currentStudent,
        guardians: [...currentStudent.guardians, newGuardian]
      });
    }
  };

  const updateGuardian = (index: number, field: keyof Guardian, value: string) => {
    if (currentStudent.guardians) {
      const updatedGuardians = [...currentStudent.guardians];
      updatedGuardians[index] = { ...updatedGuardians[index], [field]: value };
      setCurrentStudent({ ...currentStudent, guardians: updatedGuardians });
    }
  };

  const handleBooking = async () => {
    if (!students.length || !pickupLocation || !schoolLocation || !pickupTime || !selectedDays.length) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Create school transport trip for each selected day
      const promises = selectedDays.map(async (day) => {
        const tripDate = new Date();
        const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].indexOf(day);
        tripDate.setDate(tripDate.getDate() + ((dayIndex - tripDate.getDay() + 7) % 7));
        
        return dataService.createTrip({
          from: pickupLocation,
          to: schoolLocation,
          departure_date: tripDate.toISOString().split('T')[0],
          departure_time: pickupTime,
          trip_type: tripType === 'round-trip' ? 'raje3' : 'wasel',
          price_per_seat: 25, // School transport pricing
          total_seats: students.length,
          available_seats: students.length,
          preferences: {
            smoking_allowed: false,
            pets_allowed: false,
            music_allowed: false,
          },
        });
      });

      await Promise.all(promises);
      toast.success(`School transport booking submitted for ${selectedDays.length} day(s)! You will receive confirmation via SMS.`);
      
      // Reset form
      setStudents([]);
      setPickupLocation('');
      setSchoolLocation('');
      setPickupTime('');
      setReturnTime('');
      setSelectedDays([]);
      setCurrentStudent({ guardians: [] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to book school transport');
    }
  };

  const mainServiceContent = (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 p-8 md:p-12 text-white"
      >
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1685645647479-a0232f3fec6d"
            alt="School transport"
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
            <School className="w-6 h-6" />
            <span className="font-semibold">Safe School Transport</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Safe & Reliable Student Transport
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Background-checked drivers, real-time tracking, and guardian notifications for complete peace of mind.
          </p>
        </div>

        {/* 3D Animated Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-10 right-10 text-8xl opacity-30"
        >
          🚌
        </motion.div>
      </motion.div>

      {/* Safety Features */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Shield, label: 'Background Checks', color: 'text-green-600' },
          { icon: Bell, label: 'Live Notifications', color: 'text-blue-600' },
          { icon: MapPin, label: 'Real-time Tracking', color: 'text-purple-600' },
          { icon: Users, label: 'Guardian Verified', color: 'text-orange-600' }
        ].map((feature, index) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <feature.icon className={`w-8 h-8 mx-auto mb-2 ${feature.color}`} />
                <p className="text-sm font-medium">{feature.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Trip Details */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              Trip Details
            </CardTitle>
            <CardDescription>Configure your school transport schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Trip Type */}
            <div className="space-y-2">
              <Label>Trip Type</Label>
              <div className="flex gap-4">
                <Button
                  variant={tripType === 'one-way' ? 'default' : 'outline'}
                  onClick={() => setTripType('one-way')}
                  className="flex-1"
                >
                  One-Way
                </Button>
                <Button
                  variant={tripType === 'round-trip' ? 'default' : 'outline'}
                  onClick={() => setTripType('round-trip')}
                  className="flex-1"
                >
                  Round-Trip
                </Button>
              </div>
            </div>

            {/* Locations */}
            <div className="space-y-2">
              <Label htmlFor="pickup">Home/Pickup Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="pickup"
                  placeholder="Enter pickup address"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="school">School Address</Label>
              <div className="relative">
                <School className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="school"
                  placeholder="Enter school address"
                  value={schoolLocation}
                  onChange={(e) => setSchoolLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickup-time">Pickup Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="pickup-time"
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {tripType === 'round-trip' && (
                <div className="space-y-2">
                  <Label htmlFor="return-time">Return Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="return-time"
                      type="time"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Days Selection */}
            <div className="space-y-2">
              <Label>Active Days</Label>
              <div className="grid grid-cols-3 gap-2">
                {days.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={selectedDays.includes(day)}
                      onCheckedChange={() => toggleDay(day)}
                    />
                    <label
                      htmlFor={day}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {day.slice(0, 3)}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Student Details */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Student & Guardian Information
            </CardTitle>
            <CardDescription>Add students and authorized guardians</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Student Info */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="student-name">Student Name</Label>
                <Input
                  id="student-name"
                  placeholder="Full name"
                  value={currentStudent.name || ''}
                  onChange={(e) => setCurrentStudent({ ...currentStudent, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Age"
                  value={currentStudent.age || ''}
                  onChange={(e) => setCurrentStudent({ ...currentStudent, age: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Select
                  value={currentStudent.grade || ''}
                  onValueChange={(value) => setCurrentStudent({ ...currentStudent, grade: value })}
                >
                  <SelectTrigger id="grade">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(12)].map((_, i) => (
                      <SelectItem key={i + 1} value={`Grade ${i + 1}`}>
                        Grade {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Guardians */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Authorized Guardians</Label>
                <Button variant="outline" size="sm" onClick={addGuardian}>
                  + Add Guardian
                </Button>
              </div>

              {currentStudent.guardians?.map((guardian, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Input
                    placeholder="Name"
                    value={guardian.name}
                    onChange={(e) => updateGuardian(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Relationship"
                    value={guardian.relationship}
                    onChange={(e) => updateGuardian(index, 'relationship', e.target.value)}
                  />
                  <Input
                    placeholder="Phone"
                    value={guardian.phone}
                    onChange={(e) => updateGuardian(index, 'phone', e.target.value)}
                  />
                </div>
              ))}
            </div>

            <Button onClick={addStudent} variant="outline" className="w-full">
              Add Student to Booking
            </Button>

            {/* Added Students */}
            {students.length > 0 && (
              <div className="space-y-2">
                <Label>Added Students ({students.length})</Label>
                <div className="space-y-2">
                  {students.map((student, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {student.age} yrs • {student.grade} • {student.guardians.length} guardian(s)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Safety Notice */}
      <Card className="border-l-4 border-l-amber-500">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-semibold">Safety & Verification</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• All drivers undergo comprehensive background checks and child safety training</li>
                <li>• Real-time GPS tracking shared with all authorized guardians</li>
                <li>• In-vehicle cameras for student safety (optional)</li>
                <li>• Daily attendance reports sent via SMS and email</li>
                <li>• Only authorized guardians can pick up students</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Book Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleBooking}
          className="w-full h-14 text-lg bg-gradient-to-r from-yellow-500 via-amber-600 to-orange-600 hover:from-yellow-600 hover:via-amber-700 hover:to-orange-700 shadow-lg"
        >
          <School className="w-5 h-5 mr-2" />
          Book School Transport
        </Button>
      </motion.div>
    </div>
  );

  return (
    <ServiceTabs
      mainService={mainServiceContent}
      mainServiceTitle="School Transport"
      mainServiceIcon={<School className="w-4 h-4" />}
      showAllTabs={true}
    />
  );
}
