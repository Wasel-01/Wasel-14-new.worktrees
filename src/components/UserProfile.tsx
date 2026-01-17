import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  User, 
  Star, 
  Shield, 
  Car, 
  MapPin, 
  Calendar, 
  Award,
  Edit,
  CheckCircle,
  Clock,
  TrendingUp,
  Camera,
  Phone,
  Mail,
  Save,
  X,
  Check,
  Music,
  Cigarette,
  MessageCircle,
  ThermometerSun,
  PawPrint
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface UserProfileProps {
  userId?: string;
  isOwnProfile?: boolean;
}

export function UserProfile({ userId, isOwnProfile }: UserProfileProps) {
  const { profile, updateProfile, user: currentUser } = useAuth();
  
  // Determine if we are viewing our own profile
  const isOwn = isOwnProfile ?? (userId === currentUser?.id || !userId);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for editable fields
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    bio: '',
    bioAr: '',
    phone: '',
    email: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    vehiclePlate: '',
    smoking: false,
    music: true,
    pets: false,
    conversation: 'moderate' as 'quiet' | 'moderate' | 'chatty',
    temperature: 'moderate' as 'cool' | 'moderate' | 'warm',
  });

  // Load profile data
  useEffect(() => {
    if (isOwn && profile) {
      setFormData({
        name: profile.full_name || '',
        nameAr: profile.name_ar || '',
        bio: profile.bio || '',
        bioAr: profile.bio_ar || '',
        phone: profile.phone || '',
        email: profile.email || '',
        vehicleMake: profile.vehicle_make || '',
        vehicleModel: profile.vehicle_model || '',
        vehicleYear: profile.vehicle_year || '',
        vehicleColor: profile.vehicle_color || '',
        vehiclePlate: profile.vehicle_plate || '',
        smoking: profile.smoking_allowed ?? false,
        music: profile.music_allowed ?? true,
        pets: profile.pets_allowed ?? false,
        conversation: profile.conversation_style || 'moderate',
        temperature: profile.temperature_preference || 'moderate',
      });
      
      if (profile.avatar_url) {
        setProfileImage(profile.avatar_url);
      }
    }
  }, [profile, isOwn]);

  // Use profile data for stats or fall back to defaults
  const user = {
    id: userId || currentUser?.id || '1',
    verified: profile?.email_verified ?? true,
    rating: profile?.rating_as_driver || 4.8,
    totalTrips: profile?.total_trips || 0,
    memberSince: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2024',
    badges: [
      { id: 1, name: 'Verified Driver', icon: Shield, color: 'text-primary' },
      { id: 2, name: 'Super Host', icon: Award, color: 'text-accent' },
      { id: 3, name: '100+ Trips', icon: TrendingUp, color: 'text-secondary' },
      { id: 4, name: 'On-Time', icon: Clock, color: 'text-primary' }
    ],
    verifications: {
      phoneVerified: profile?.phone_verified ?? false,
      emailVerified: profile?.email_verified ?? true,
      licenseVerified: true,
      idVerified: true,
      profileComplete: 85
    },
    stats: {
      asDriver: profile?.trips_as_driver || 0,
      asPassenger: profile?.trips_as_passenger || 0,
      rating: profile?.rating_as_driver || 4.8,
      responseRate: 95,
      acceptanceRate: 88,
      cancellationRate: 2
    },
    reviews: [
      {
        id: 1,
        reviewer: 'Fatima Hassan',
        reviewerImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        rating: 5,
        comment: 'Excellent driver! Very punctual and friendly.',
        commentAr: 'سائق ممتاز! دقيق جداً وودود.',
        date: '2 days ago',
        trip: 'Dubai → Abu Dhabi'
      },
      {
        id: 2,
        reviewer: 'Mohammed Ali',
        reviewerImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100',
        rating: 4.5,
        comment: 'Great conversation and smooth ride. Highly recommended.',
        commentAr: 'محادثة رائعة ورحلة سلسة. أوصي به بشدة.',
        date: '1 week ago',
        trip: 'Sharjah → Dubai'
      },
      {
        id: 3,
        reviewer: 'Sara Abdullah',
        reviewerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
        rating: 5,
        comment: 'Very professional and clean car. Will ride again!',
        commentAr: 'محترف جداً والسيارة نظيفة. سأركب معه مرة أخرى!',
        date: '2 weeks ago',
        trip: 'Dubai Marina → Downtown'
      }
    ]
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        // In a real app, we would upload this file to Supabase Storage here
        // and then update the avatar_url in the profile
        // For now we just update the local state to show it works
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Prepare updates
    // Note: KV store is schema-less so we can add new fields freely
    const updates = {
      full_name: formData.name,
      name_ar: formData.nameAr,
      bio: formData.bio,
      bio_ar: formData.bioAr,
      phone: formData.phone,
      // email is not updated here
      vehicle_make: formData.vehicleMake,
      vehicle_model: formData.vehicleModel,
      vehicle_year: formData.vehicleYear,
      vehicle_color: formData.vehicleColor,
      vehicle_plate: formData.vehiclePlate,
      smoking_allowed: formData.smoking,
      music_allowed: formData.music,
      pets_allowed: formData.pets,
      conversation_style: formData.conversation,
      temperature_preference: formData.temperature,
    };

    try {
      const { error } = await updateProfile(updates);
      if (error) {
        toast.error('Failed to update profile');
        console.error(error);
      } else {
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to current profile values
    if (profile) {
      setFormData({
        name: profile.full_name || '',
        nameAr: profile.name_ar || '',
        bio: profile.bio || '',
        bioAr: profile.bio_ar || '',
        phone: profile.phone || '',
        email: profile.email || '',
        vehicleMake: profile.vehicle_make || '',
        vehicleModel: profile.vehicle_model || '',
        vehicleYear: profile.vehicle_year || '',
        vehicleColor: profile.vehicle_color || '',
        vehiclePlate: profile.vehicle_plate || '',
        smoking: profile.smoking_allowed ?? false,
        music: profile.music_allowed ?? true,
        pets: profile.pets_allowed ?? false,
        conversation: profile.conversation_style || 'moderate',
        temperature: profile.temperature_preference || 'moderate',
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header - Enhanced */}
      <Card className="border-2 shadow-lg overflow-hidden">
        {/* Cover Background */}
        <div className="h-32 bg-gradient-to-r from-primary via-blue-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        <CardContent className="pt-0 pb-8">
          <div className="flex flex-col md:flex-row gap-6 -mt-16 relative z-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-900 shadow-xl bg-white">
                  <img src={profileImage} alt={formData.name} className="w-full h-full object-cover" />
                </div>
                {isOwn && isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {user.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-primary text-white rounded-full p-2 shadow-lg">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                )}
              </div>

              {isOwn && (
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="shadow-md" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={handleSave} 
                        className="bg-green-600 hover:bg-green-700 shadow-md" 
                        size="sm"
                        disabled={isLoading}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button 
                        onClick={handleCancel} 
                        variant="outline" 
                        size="sm"
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="flex-1 space-y-4 mt-4 md:mt-0">
              {isEditing ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameAr">الاسم بالعربية</Label>
                    <Input
                      id="nameAr"
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      className="border-2 text-right"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="border-2 bg-gray-100 dark:bg-gray-800 opacity-70"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="border-2 resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bioAr">نبذة بالعربية</Label>
                    <Textarea
                      id="bioAr"
                      value={formData.bioAr}
                      onChange={(e) => setFormData({ ...formData, bioAr: e.target.value })}
                      className="border-2 resize-none text-right"
                      dir="rtl"
                      rows={2}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h1 className="text-3xl">{formData.name}</h1>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="text-xl font-semibold">{user.rating}</span>
                        <span className="text-muted-foreground text-base">({user.totalTrips} trips)</span>
                      </div>
                    </div>
                    {formData.nameAr && (
                      <p className="text-muted-foreground text-lg" dir="rtl">{formData.nameAr}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Member since {user.memberSince}
                      </div>
                      {formData.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {formData.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {formData.email}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-foreground leading-relaxed">{formData.bio || 'No bio provided'}</p>
                    {formData.bioAr && (
                      <p className="text-foreground text-right leading-relaxed" dir="rtl">{formData.bioAr}</p>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {user.badges.map(badge => (
                      <Badge key={badge.id} variant="outline" className="gap-1 px-3 py-1 text-sm">
                        <badge.icon className={`w-4 h-4 ${badge.color}`} />
                        {badge.name}
                      </Badge>
                    ))}
                  </div>

                  {/* Verification Progress */}
                  <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Profile Completeness</span>
                      <span className="text-lg font-bold text-primary">{user.verifications.profileComplete}%</span>
                    </div>
                    <Progress value={user.verifications.profileComplete} className="h-3" />
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant={user.verifications.phoneVerified ? "default" : "outline"} className="gap-1">
                        {user.verifications.phoneVerified && <Check className="w-3 h-3" />}
                        Phone
                      </Badge>
                      <Badge variant={user.verifications.emailVerified ? "default" : "outline"} className="gap-1">
                        {user.verifications.emailVerified && <Check className="w-3 h-3" />}
                        Email
                      </Badge>
                      <Badge variant={user.verifications.licenseVerified ? "default" : "outline"} className="gap-1">
                        {user.verifications.licenseVerified && <Check className="w-3 h-3" />}
                        License
                      </Badge>
                      <Badge variant={user.verifications.idVerified ? "default" : "outline"} className="gap-1">
                        {user.verifications.idVerified && <Check className="w-3 h-3" />}
                        ID
                      </Badge>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs - Enhanced */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 h-12">
          <TabsTrigger value="overview" className="text-base">Overview</TabsTrigger>
          <TabsTrigger value="reviews" className="text-base">Reviews</TabsTrigger>
          <TabsTrigger value="vehicle" className="text-base">Vehicle</TabsTrigger>
          <TabsTrigger value="preferences" className="text-base">Preferences</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Car className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-primary">{user.stats.asDriver}</p>
                    <p className="text-sm text-muted-foreground mt-1">Trips as Driver</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                    <User className="w-8 h-8 text-secondary" />
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-secondary">{user.stats.asPassenger}</p>
                    <p className="text-sm text-muted-foreground mt-1">Trips as Passenger</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto">
                    <Star className="w-8 h-8 text-amber-500 fill-current" />
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-amber-500">{user.stats.rating}</p>
                    <p className="text-sm text-muted-foreground mt-1">Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle>Reliability Metrics</CardTitle>
              <CardDescription>Your performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Response Rate</span>
                  <span className="text-lg font-bold text-primary">{user.stats.responseRate}%</span>
                </div>
                <Progress value={user.stats.responseRate} className="h-3" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Acceptance Rate</span>
                  <span className="text-lg font-bold text-secondary">{user.stats.acceptanceRate}%</span>
                </div>
                <Progress value={user.stats.acceptanceRate} className="h-3" />
              </div>
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="text-sm font-medium">Cancellation Rate</span>
                <Badge variant="outline" className="text-base">
                  {user.stats.cancellationRate}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="text-center md:text-left">
                  <div className="text-6xl font-bold">{user.rating}</div>
                  <div className="flex items-center justify-center md:justify-start gap-1 text-amber-500 mt-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{user.totalTrips} reviews</p>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm w-20 font-medium">{rating} stars</span>
                      <Progress value={rating === 5 ? 75 : rating === 4 ? 20 : 5} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {rating === 5 ? '75%' : rating === 4 ? '20%' : '5%'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-t pt-4 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={review.reviewerImage}
                      alt={review.reviewer}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{review.reviewer}</p>
                          <p className="text-sm text-muted-foreground">{review.trip}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-semibold">{review.rating}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                      <p className="text-foreground mb-1">{review.comment}</p>
                      <p className="text-foreground text-right" dir="rtl">{review.commentAr}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicle Tab */}
        <TabsContent value="vehicle">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>Your registered vehicle details</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleMake">Make</Label>
                    <Input
                      id="vehicleMake"
                      value={formData.vehicleMake}
                      onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleModel">Model</Label>
                    <Input
                      id="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleYear">Year</Label>
                    <Input
                      id="vehicleYear"
                      value={formData.vehicleYear}
                      onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleColor">Color</Label>
                    <Input
                      id="vehicleColor"
                      value={formData.vehicleColor}
                      onChange={(e) => setFormData({ ...formData, vehicleColor: e.target.value })}
                      className="border-2"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="vehiclePlate">License Plate</Label>
                    <Input
                      id="vehiclePlate"
                      value={formData.vehiclePlate}
                      onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                      className="border-2"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Car className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Make & Model</p>
                        <p className="font-semibold text-lg">
                          {formData.vehicleMake || formData.vehicleModel ? 
                            `${formData.vehicleMake} ${formData.vehicleModel}` : 
                            'Not set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Year</p>
                        <p className="font-semibold text-lg">{formData.vehicleYear || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="w-12 h-12 rounded-full border-4 border-foreground bg-gray-400"></div>
                      <div>
                        <p className="text-sm text-muted-foreground">Color</p>
                        <p className="font-semibold text-lg">{formData.vehicleColor || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">License Plate</p>
                        <p className="font-semibold text-lg">{formData.vehiclePlate || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Ride Preferences</CardTitle>
              <CardDescription>Set your comfort preferences for rides</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-transparent hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Cigarette className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Smoking</span>
                  </div>
                  {isEditing ? (
                    <Button 
                      variant={formData.smoking ? "destructive" : "outline"} 
                      onClick={() => setFormData({ ...formData, smoking: !formData.smoking })}
                      size="sm"
                    >
                      {formData.smoking ? 'Allowed' : 'Not Allowed'}
                    </Button>
                  ) : (
                    <Badge variant={formData.smoking ? "destructive" : "default"} className="text-sm">
                      {formData.smoking ? 'Allowed' : 'Not Allowed'}
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-transparent hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Music className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Music</span>
                  </div>
                  {isEditing ? (
                    <Button 
                      variant={formData.music ? "default" : "outline"} 
                      onClick={() => setFormData({ ...formData, music: !formData.music })}
                      size="sm"
                    >
                      {formData.music ? 'Allowed' : 'Not Allowed'}
                    </Button>
                  ) : (
                    <Badge variant={formData.music ? "default" : "destructive"} className="text-sm">
                      {formData.music ? 'Allowed' : 'Not Allowed'}
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-transparent hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <PawPrint className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Pets</span>
                  </div>
                  {isEditing ? (
                    <Button 
                      variant={formData.pets ? "default" : "outline"} 
                      onClick={() => setFormData({ ...formData, pets: !formData.pets })}
                      size="sm"
                    >
                      {formData.pets ? 'Allowed' : 'Not Allowed'}
                    </Button>
                  ) : (
                    <Badge variant={formData.pets ? "default" : "destructive"} className="text-sm">
                      {formData.pets ? 'Allowed' : 'Not Allowed'}
                    </Badge>
                  )}
                </div>
                
                {/* Conversation Preference */}
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-transparent hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Conversation</span>
                  </div>
                  {isEditing ? (
                    <select 
                      value={formData.conversation}
                      onChange={(e) => setFormData({ ...formData, conversation: e.target.value as any })}
                      className="bg-white dark:bg-gray-900 border rounded px-2 py-1 text-sm"
                    >
                      <option value="quiet">Quiet</option>
                      <option value="moderate">Moderate</option>
                      <option value="chatty">Chatty</option>
                    </select>
                  ) : (
                    <Badge variant="outline" className="text-sm capitalize">
                      {formData.conversation}
                    </Badge>
                  )}
                </div>

                {/* Temperature Preference */}
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-transparent hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <ThermometerSun className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Temperature</span>
                  </div>
                  {isEditing ? (
                    <select 
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: e.target.value as any })}
                      className="bg-white dark:bg-gray-900 border rounded px-2 py-1 text-sm"
                    >
                      <option value="cool">Cool</option>
                      <option value="moderate">Moderate</option>
                      <option value="warm">Warm</option>
                    </select>
                  ) : (
                    <Badge variant="outline" className="text-sm capitalize">
                      {formData.temperature}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}