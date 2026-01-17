/**
 * User Management Component
 * 
 * Complete user administration including search, filter,
 * suspend/ban, verification management.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  Search, 
  Filter, 
  Ban, 
  CheckCircle, 
  XCircle,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  Shield
} from 'lucide-react';
import { supabase } from '../../services/api';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'passenger' | 'driver' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  verified: boolean;
  rating: number;
  total_trips: number;
  created_at: string;
  last_active: string;
  profile_photo?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, statusFilter, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // In production, this data comes from backend
      const mockUsers: User[] = (data || []).map(profile => ({
        id: profile.id,
        email: profile.email || 'user@example.com',
        full_name: profile.full_name || 'User',
        phone: profile.phone || '+971501234567',
        role: profile.role || 'passenger',
        status: profile.status || 'active',
        verified: profile.verified || false,
        rating: profile.rating || 4.5,
        total_trips: profile.total_trips || 0,
        created_at: profile.created_at,
        last_active: profile.updated_at || profile.created_at,
        profile_photo: profile.avatar_url,
      }));

      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleSuspendUser = async (userId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to suspend this user? They will not be able to use the platform.'
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended', updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User suspended successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to suspend user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User activated successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to activate user:', error);
      toast.error('Failed to activate user');
    }
  };

  const handleBanUser = async (userId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to BAN this user? This action is severe and should only be used for serious violations.'
    );

    if (!confirmed) return;

    const reason = window.prompt('Enter reason for ban:');
    if (!reason) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: 'banned', 
          ban_reason: reason,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User banned successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to ban user:', error);
      toast.error('Failed to ban user');
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified: true, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User verified successfully');
      loadUsers();
    } catch (error) {
      console.error('Failed to verify user:', error);
      toast.error('Failed to verify user');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'suspended':
        return <Badge variant="secondary">Suspended</Badge>;
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'driver':
        return <Badge variant="default">Driver</Badge>;
      case 'passenger':
        return <Badge variant="secondary">Passenger</Badge>;
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="passenger">Passengers</SelectItem>
                <SelectItem value="driver">Drivers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Trips</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.profile_photo} />
                        <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {user.full_name}
                          {user.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {user.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      ⭐ {user.rating.toFixed(1)}
                    </div>
                  </TableCell>
                  <TableCell>{user.total_trips}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.status === 'active' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendUser(user.id)}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                          {!user.verified && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerifyUser(user.id)}
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      ) : user.status === 'suspended' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivateUser(user.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleBanUser(user.id)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <Badge variant="destructive">Banned</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
