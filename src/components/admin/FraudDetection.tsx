/**
 * Fraud Detection Component
 * 
 * AI-powered fraud detection and prevention system.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertTriangle, Shield, Eye, Ban } from 'lucide-react';

interface FraudAlert {
  id: string;
  type: 'fake_gps' | 'multiple_accounts' | 'payment_fraud' | 'rating_manipulation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id: string;
  user_name: string;
  description: string;
  evidence: string[];
  confidence: number;
  created_at: string;
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive';
}

export function FraudDetection() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([
    {
      id: '1',
      type: 'fake_gps',
      severity: 'high',
      user_id: 'user123',
      user_name: 'Suspicious Driver #1',
      description: 'GPS location jumps detected - possible location spoofing',
      evidence: ['3 trips with impossible location changes', 'GPS accuracy below threshold'],
      confidence: 87,
      created_at: new Date().toISOString(),
      status: 'pending',
    },
    {
      id: '2',
      type: 'multiple_accounts',
      severity: 'critical',
      user_id: 'user456',
      user_name: 'User Group A',
      description: 'Multiple accounts detected from same device and payment method',
      evidence: ['4 accounts sharing device ID', 'Same payment card used'],
      confidence: 95,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      status: 'investigating',
    },
  ]);

  const getSeverityBadge = (severity: string) => {
    const config = {
      low: { variant: 'secondary' as const, label: 'Low' },
      medium: { variant: 'default' as const, label: 'Medium' },
      high: { variant: 'destructive' as const, label: 'High' },
      critical: { variant: 'destructive' as const, label: 'CRITICAL' },
    };

    return <Badge variant={config[severity as keyof typeof config]?.variant || 'outline'}>
      {config[severity as keyof typeof config]?.label || severity}
    </Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(a => a.severity === 'critical').length}
            </div>
            <p className="text-sm text-muted-foreground">Critical Alerts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {alerts.filter(a => a.severity === 'high').length}
            </div>
            <p className="text-sm text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {alerts.filter(a => a.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter(a => a.status === 'resolved').length}
            </div>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Fraud Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Fraud Alerts</CardTitle>
          <CardDescription>AI-detected suspicious activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg ${
                  alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${
                      alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'
                    }`} />
                    <div>
                      <div className="font-semibold">{alert.user_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {alert.type.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getSeverityBadge(alert.severity)}
                    <Badge variant="outline">{alert.confidence}% confidence</Badge>
                  </div>
                </div>

                <p className="text-sm mb-3">{alert.description}</p>

                <div className="mb-3">
                  <p className="text-xs font-semibold mb-1">Evidence:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {alert.evidence.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    Investigate
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Ban className="w-4 h-4 mr-2" />
                    Take Action
                  </Button>
                  <Button size="sm" variant="ghost">
                    Mark as False Positive
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
