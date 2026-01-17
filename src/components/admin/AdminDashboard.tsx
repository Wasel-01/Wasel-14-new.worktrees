/**
 * Admin Dashboard - Complete Platform Management
 * 
 * Comprehensive admin interface for managing users, trips,
 * disputes, financials, and system health.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Users, 
  Car, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp,
  Shield,
  Activity,
  Search,
  Filter,
  Download,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/api';
import { UserManagement } from './UserManagement';
import { TripMonitoring } from './TripMonitoring';
import { DisputeManagement } from './DisputeManagement';
import { FinancialReports } from './FinancialReports';
import { FraudDetection } from './FraudDetection';
import { SystemHealth } from './SystemHealth';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    drivers: number;
    passengers: number;
    newToday: number;
    suspended: number;
  };
  trips: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    todayRevenue: number;
  };
  disputes: {
    open: number;
    underReview: number;
    resolved: number;
    avgResolutionTime: number;
  };
  financials: {
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
    pendingPayouts: number;
  };
  system: {
    uptime: number;
    apiResponseTime: number;
    errorRate: number;
    activeConnections: number;
  };
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      // In production, fetch from backend
      // For now, use aggregated queries
      
      const [usersData, tripsData] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('trips').select('*'),
      ]);

      const mockStats: DashboardStats = {
        users: {
          total: usersData.data?.length || 0,
          active: usersData.data?.filter(u => u.is_active).length || 0,
          drivers: usersData.data?.filter(u => u.role === 'driver').length || 0,
          passengers: usersData.data?.filter(u => u.role === 'passenger').length || 0,
          newToday: 12,
          suspended: 3,
        },
        trips: {
          total: tripsData.data?.length || 0,
          active: tripsData.data?.filter(t => ['waiting', 'in_progress'].includes(t.status)).length || 0,
          completed: tripsData.data?.filter(t => t.status === 'completed').length || 0,
          cancelled: tripsData.data?.filter(t => t.status === 'cancelled').length || 0,
          todayRevenue: 15420.50,
        },
        disputes: {
          open: 8,
          underReview: 12,
          resolved: 145,
          avgResolutionTime: 24.5,
        },
        financials: {
          todayRevenue: 15420.50,
          weekRevenue: 89450.75,
          monthRevenue: 345890.25,
          pendingPayouts: 12450.30,
        },
        system: {
          uptime: 99.98,
          apiResponseTime: 145,
          errorRate: 0.02,
          activeConnections: 342,
        },
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Platform management and monitoring
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={loadDashboardStats}>
                <Activity className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="trips">Live Trips</TabsTrigger>
            <TabsTrigger value="disputes">Disputes</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.users.total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+{stats.users.newToday}</span> new today
                  </p>
                  <div className="mt-2 flex gap-2 text-xs">
                    <Badge variant="secondary">{stats.users.drivers} Drivers</Badge>
                    <Badge variant="secondary">{stats.users.passengers} Passengers</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Active Trips */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
                  <Car className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.trips.active}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.trips.completed} completed today
                  </p>
                  <div className="mt-2">
                    <Badge variant="destructive">{stats.trips.cancelled} cancelled</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Revenue */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    AED {stats.financials.todayRevenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AED {stats.financials.monthRevenue.toLocaleString()} this month
                  </p>
                  <div className="mt-2">
                    <Badge variant="secondary">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12.5%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Open Disputes */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.disputes.open}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.disputes.underReview} under review
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline">
                      Avg {stats.disputes.avgResolutionTime}h resolution
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Real-time platform status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Uptime</span>
                      <Badge variant="default">Healthy</Badge>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {stats.system.uptime}%
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">API Response</span>
                      <Badge variant="default">Good</Badge>
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.system.apiResponseTime}ms
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Error Rate</span>
                      <Badge variant="default">Low</Badge>
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.system.errorRate}%
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Active Users</span>
                      <Badge variant="secondary">Live</Badge>
                    </div>
                    <div className="text-2xl font-bold">
                      {stats.system.activeConnections}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'trip', message: 'New trip completed', user: 'Ahmed M.', time: '2 min ago', status: 'success' },
                    { type: 'user', message: 'New driver registered', user: 'Sarah K.', time: '5 min ago', status: 'info' },
                    { type: 'dispute', message: 'Dispute filed', user: 'Mohammed A.', time: '12 min ago', status: 'warning' },
                    { type: 'payment', message: 'Payout processed', user: 'Driver #1234', time: '15 min ago', status: 'success' },
                    { type: 'system', message: 'System backup completed', user: 'System', time: '1 hour ago', status: 'info' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">{activity.user}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          {/* Trip Monitoring Tab */}
          <TabsContent value="trips">
            <TripMonitoring />
          </TabsContent>

          {/* Dispute Management Tab */}
          <TabsContent value="disputes">
            <DisputeManagement />
          </TabsContent>

          {/* Financial Reports Tab */}
          <TabsContent value="financials">
            <FinancialReports />
          </TabsContent>

          {/* Fraud Detection Tab */}
          <TabsContent value="fraud">
            <FraudDetection />
          </TabsContent>

          {/* System Health Tab */}
          <TabsContent value="system">
            <SystemHealth />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
