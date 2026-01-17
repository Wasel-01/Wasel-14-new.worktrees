/**
 * Financial Reports Component
 * 
 * Financial analytics, revenue tracking, and payout management.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Download, TrendingUp, DollarSign, CreditCard, Users } from 'lucide-react';

export function FinancialReports() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  const financialData = {
    revenue: {
      total: 345890.25,
      trips: 289340.50,
      platformFees: 56549.75,
      growth: 12.5,
    },
    payouts: {
      pending: 12450.30,
      processed: 231472.40,
      failed: 125.50,
    },
    breakdown: {
      rides: 245680.30,
      delivery: 43660.20,
      cancellations: -2450.25,
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-muted-foreground">Revenue and payout analytics</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="year">This Year</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="space-y-4 mt-6">
          {/* Revenue Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  AED {financialData.revenue.total.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                  <TrendingUp className="w-4 h-4" />
                  +{financialData.revenue.growth}% from last period
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  AED {financialData.revenue.platformFees.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {((financialData.revenue.platformFees / financialData.revenue.total) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  AED {financialData.payouts.pending.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  To be processed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>By service type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ride Services</span>
                <span className="font-bold">AED {financialData.breakdown.rides.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Delivery Services</span>
                <span className="font-bold">AED {financialData.breakdown.delivery.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-red-600">
                <span className="text-sm font-medium">Cancellation Refunds</span>
                <span className="font-bold">AED {financialData.breakdown.cancellations.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payout Status */}
          <Card>
            <CardHeader>
              <CardTitle>Payout Status</CardTitle>
              <CardDescription>Driver payment processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div>
                  <p className="font-semibold">Pending Payouts</p>
                  <p className="text-sm text-muted-foreground">Awaiting processing</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">AED {financialData.payouts.pending.toLocaleString()}</p>
                  <Button size="sm" className="mt-2">Process All</Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div>
                  <p className="font-semibold">Processed Payouts</p>
                  <p className="text-sm text-muted-foreground">Successfully completed</p>
                </div>
                <p className="text-2xl font-bold">AED {financialData.payouts.processed.toLocaleString()}</p>
              </div>

              {financialData.payouts.failed > 0 && (
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div>
                    <p className="font-semibold">Failed Payouts</p>
                    <p className="text-sm text-muted-foreground">Requires attention</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">AED {financialData.payouts.failed.toLocaleString()}</p>
                    <Button size="sm" variant="destructive" className="mt-2">Review</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
