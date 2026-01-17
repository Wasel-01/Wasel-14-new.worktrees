import { useState } from 'react';
import { Star, MapPin, Clock, DollarSign, Trash2, Plus, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';

export function Favorites() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const [favoriteRoutes, setFavoriteRoutes] = useState([
    {
      id: 1,
      from: 'Dubai Marina',
      to: 'Business Bay',
      savedTimes: 45,
      avgPrice: 25,
      lastUsed: '2 days ago',
    },
    {
      id: 2,
      from: 'Sharjah City Center',
      to: 'Dubai Mall',
      savedTimes: 32,
      avgPrice: 35,
      lastUsed: '1 week ago',
    },
    {
      id: 3,
      from: 'Abu Dhabi Corniche',
      to: 'Yas Island',
      savedTimes: 18,
      avgPrice: 30,
      lastUsed: '3 days ago',
    },
  ]);

  const [favoriteDrivers, setFavoriteDrivers] = useState([
    {
      id: 1,
      name: 'Ahmed Mohammed',
      rating: 4.9,
      trips: 28,
      vehicle: 'Toyota Camry 2023',
      lastTrip: '1 week ago',
    },
    {
      id: 2,
      name: 'Sara Ali',
      rating: 4.8,
      trips: 15,
      vehicle: 'Honda Accord 2022',
      lastTrip: '3 days ago',
    },
  ]);

  const removeFavoriteRoute = (id: number) => {
    setFavoriteRoutes(favoriteRoutes.filter(r => r.id !== id));
    toast.success('Route removed from favorites');
  };

  const removeFavoriteDriver = (id: number) => {
    setFavoriteDrivers(favoriteDrivers.filter(d => d.id !== id));
    toast.success('Driver removed from favorites');
  };

  const bookFavoriteRoute = (route: typeof favoriteRoutes[0]) => {
    toast.success(`Searching for rides from ${route.from} to ${route.to}`);
  };

  const requestFavoriteDriver = (driver: typeof favoriteDrivers[0]) => {
    toast.success(`Request sent to ${driver.name}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">My Favorites</h1>
          <p className="text-muted-foreground">
            Quick access to your favorite routes and drivers • المفضلة
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search favorites..."
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="routes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="routes">
            Favorite Routes ({favoriteRoutes.length})
          </TabsTrigger>
          <TabsTrigger value="drivers">
            Favorite Drivers ({favoriteDrivers.length})
          </TabsTrigger>
        </TabsList>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-4">
          {favoriteRoutes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Star className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No favorite routes yet. Star a route to save it here!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteRoutes.map((route) => (
                <Card key={route.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{route.from}</p>
                            <div className="h-6 border-l-2 border-dashed border-muted ml-2" />
                            <p className="font-medium">{route.to}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavoriteRoute(route.id)}
                      >
                        <Star className="w-4 h-4 fill-primary text-primary" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Used</p>
                          <p className="font-medium">{route.savedTimes} times</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Avg. Price</p>
                          <p className="font-medium">AED {route.avgPrice}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last used {route.lastUsed}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => bookFavoriteRoute(route)}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Find Rides
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => removeFavoriteRoute(route.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="space-y-4">
          {favoriteDrivers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Star className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No favorite drivers yet. Star a driver to save them here!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteDrivers.map((driver) => (
                <Card key={driver.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {driver.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{driver.name}</p>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-3 h-3 fill-primary text-primary" />
                            <span>{driver.rating}</span>
                            <span className="text-muted-foreground">• {driver.trips} trips</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavoriteDriver(driver.id)}
                      >
                        <Star className="w-4 h-4 fill-primary text-primary" />
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Vehicle</span>
                        <span className="font-medium">{driver.vehicle}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Last trip</span>
                        <span className="font-medium">{driver.lastTrip}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => requestFavoriteDriver(driver)}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Request Ride
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => removeFavoriteDriver(driver.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Favorites</p>
                <p className="text-2xl">{favoriteRoutes.length + favoriteDrivers.length}</p>
              </div>
              <Star className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Favorite Routes</p>
                <p className="text-2xl">{favoriteRoutes.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Favorite Drivers</p>
                <p className="text-2xl">{favoriteDrivers.length}</p>
              </div>
              <Star className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
