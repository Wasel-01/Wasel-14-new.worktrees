/**
 * Ride Social - UNIQUE FEATURE
 * 
 * Social features for sharing rides, splitting costs with friends,
 * and building a community
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, UserPlus, Share2, MessageCircle, Star, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Friend {
  id: string;
  name: string;
  photo?: string;
  isOnline: boolean;
  totalRidesTogether: number;
  lastRideDate: string;
}

interface SharedRide {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  friends: Friend[];
  totalCost: number;
  splitCost: number;
  status: 'pending' | 'accepted' | 'completed';
}

export function RideSocial() {
  const [friends, setFriends] = useState<Friend[]>([
    {
      id: '1',
      name: 'Sarah Ahmed',
      photo: '',
      isOnline: true,
      totalRidesTogether: 24,
      lastRideDate: '2026-01-01',
    },
    {
      id: '2',
      name: 'Mohammed Ali',
      isOnline: false,
      totalRidesTogether: 12,
      lastRideDate: '2025-12-28',
    },
  ]);

  const [sharedRides, setSharedRides] = useState<SharedRide[]>([
    {
      id: '1',
      from: 'Dubai Marina',
      to: 'Mall of Emirates',
      date: '2026-01-03',
      time: '14:00',
      friends: [friends[0]],
      totalCost: 45,
      splitCost: 22.5,
      status: 'pending',
    },
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Ride Together
        </h1>
        <p className="text-muted-foreground">
          Share rides with friends and save money
        </p>
      </motion.div>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="shared">Shared Rides</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        {/* Friends Tab */}
        <TabsContent value="friends" className="space-y-4">
          {/* Add Friend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Add Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input placeholder="Enter phone number or email" />
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Friends List */}
          <div className="grid md:grid-cols-2 gap-4">
            {friends.map((friend, index) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={friend.photo} />
                            <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {friend.isOnline && (
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-semibold">{friend.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {friend.totalRidesTogether} rides together
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last: {new Date(friend.lastRideDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                          <Share2 className="w-4 h-4 mr-2" />
                          Invite
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Shared Rides Tab */}
        <TabsContent value="shared" className="space-y-4">
          {/* Create Shared Ride */}
          <Card className="border-2 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle>Create Shared Ride</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Plan a Ride with Friends
              </Button>
            </CardContent>
          </Card>

          {/* Shared Rides List */}
          {sharedRides.map((ride) => (
            <Card key={ride.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge className="mb-2">
                      {ride.status === 'pending' ? 'Awaiting Confirmation' : 'Confirmed'}
                    </Badge>
                    <h3 className="font-semibold text-lg">
                      {ride.from} → {ride.to}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ride.date).toLocaleDateString()} at {ride.time}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground line-through">
                      AED {ride.totalCost}
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      AED {ride.splitCost}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Split with {ride.friends.length} friend{ride.friends.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Friends in Ride */}
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-sm font-medium">Riding with:</p>
                  <div className="flex -space-x-2">
                    {ride.friends.map((friend) => (
                      <Avatar key={friend.id} className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={friend.photo} />
                        <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>

                {ride.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button className="flex-1">Accept & Book</Button>
                    <Button variant="outline" className="flex-1">Decline</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ride Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: '🚗', title: 'Eco Warrior', desc: '50 eco rides' },
                  { icon: '👥', title: 'Social Rider', desc: '20 shared rides' },
                  { icon: '⭐', title: 'Top Rated', desc: '4.9+ rating' },
                  { icon: '💰', title: 'Money Saver', desc: 'Saved AED 500' },
                ].map((achievement, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-xl text-center"
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h4 className="font-semibold text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.desc}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                This Week's Top Riders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Ahmed M.', rides: 24, savings: 180 },
                  { rank: 2, name: 'Sarah K.', rides: 22, savings: 165 },
                  { rank: 3, name: 'Mohammed A.', rides: 20, savings: 150 },
                ].map((user) => (
                  <div key={user.rank} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold
                        ${user.rank === 1 ? 'bg-yellow-500 text-white' : ''}
                        ${user.rank === 2 ? 'bg-gray-400 text-white' : ''}
                        ${user.rank === 3 ? 'bg-orange-600 text-white' : ''}
                      `}>
                        {user.rank}
                      </div>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.rides} rides</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">AED {user.savings}</p>
                      <p className="text-xs text-muted-foreground">saved</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
