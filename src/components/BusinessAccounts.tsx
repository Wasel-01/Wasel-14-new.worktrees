import { useState } from 'react';
import { Building2, Users, TrendingUp, Calendar, Download, Plus, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';

export function BusinessAccounts() {
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Ahmed Mohammed', email: 'ahmed@company.com', department: 'Sales', trips: 45, spent: 1250 },
    { id: 2, name: 'Sara Ali', email: 'sara@company.com', department: 'Marketing', trips: 32, spent: 890 },
    { id: 3, name: 'Omar Hassan', email: 'omar@company.com', department: 'Engineering', trips: 28, spent: 780 },
  ]);

  const [fleetDrivers, setFleetDrivers] = useState([
    { id: 1, name: 'Khalid Ahmed', vehicle: 'Toyota Camry 2023', trips: 156, earnings: 12400, rating: 4.9 },
    { id: 2, name: 'Fatima Said', vehicle: 'Honda Accord 2022', trips: 142, earnings: 11200, rating: 4.8 },
  ]);

  const handleAddEmployee = () => {
    toast.success('Employee added successfully!');
    setShowAddEmployee(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Business Dashboard</h1>
          <p className="text-muted-foreground">Manage corporate accounts and fleet operations</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl">24</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fleet Drivers</p>
                <p className="text-2xl">8</p>
              </div>
              <Building2 className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl">AED 15,420</p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trips</p>
                <p className="text-2xl">342</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employee Management</TabsTrigger>
          <TabsTrigger value="fleet">Fleet Operations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        {/* Employee Management */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Employee Accounts</CardTitle>
                  <CardDescription>Manage employee access and track usage</CardDescription>
                </div>
                <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Employee
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Employee</DialogTitle>
                      <DialogDescription>
                        Add an employee to your corporate Wassel account
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input placeholder="Employee name" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="employee@company.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly Budget (AED)</Label>
                        <Input type="number" placeholder="500" />
                      </div>
                      <Button onClick={handleAddEmployee} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                        Add Employee
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Trips</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>{emp.name}</TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell>{emp.trips}</TableCell>
                      <TableCell>AED {emp.spent}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-primary">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fleet Operations */}
        <TabsContent value="fleet" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Fleet Drivers</CardTitle>
                  <CardDescription>Monitor your fleet driver performance</CardDescription>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Driver
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver Name</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Total Trips</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fleetDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell>{driver.name}</TableCell>
                      <TableCell>{driver.vehicle}</TableCell>
                      <TableCell>{driver.trips}</TableCell>
                      <TableCell>AED {driver.earnings.toLocaleString()}</TableCell>
                      <TableCell className="flex items-center gap-1">
                        ⭐ {driver.rating}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-primary">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Invoices</CardTitle>
              <CardDescription>Manage your corporate billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl">AED 5,240</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl">AED 15,420</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Average/Month</p>
                  <p className="text-2xl">AED 14,200</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Recent Invoices</h3>
                <div className="space-y-2">
                  {[
                    { month: 'November 2025', amount: 15420, status: 'Paid' },
                    { month: 'October 2025', amount: 14230, status: 'Paid' },
                    { month: 'September 2025', amount: 13890, status: 'Paid' },
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p>{invoice.month}</p>
                        <p className="text-sm text-muted-foreground">AED {invoice.amount.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-primary">{invoice.status}</Badge>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Travel Policies</CardTitle>
              <CardDescription>Set rules and budgets for employee travel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Default Budget Per Employee</h3>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <p className="text-2xl">AED 500/month</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Approval Required</h3>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <p className="text-muted-foreground">Trips over AED 100 require manager approval</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Allowed Trip Types</h3>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="default" className="bg-primary">Business Trips</Badge>
                    <Badge variant="default" className="bg-primary">Airport Transfers</Badge>
                    <Badge variant="default" className="bg-primary">Client Meetings</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
