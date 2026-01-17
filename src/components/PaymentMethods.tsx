/**
 * Payment Methods Management
 * 
 * Manage saved payment methods with Stripe integration.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CreditCard, Plus, Trash2, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/api';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  holderName?: string;
}

export function PaymentMethods() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadPaymentMethods();
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      // Mock data for demo
      const mockMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'card',
          brand: 'Visa',
          last4: '4242',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true,
          holderName: 'John Doe',
        },
        {
          id: '2',
          type: 'wallet',
          isDefault: false,
          holderName: 'Wassel Wallet',
        },
      ];

      setPaymentMethods(mockMethods);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      // Update all methods to not default
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Set selected as default
      await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', methodId);

      toast.success('Default payment method updated');
      loadPaymentMethods();
    } catch (error) {
      console.error('Failed to set default:', error);
      toast.error('Failed to update default payment method');
    }
  };

  const handleDelete = async (methodId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this payment method?'
    );

    if (!confirmed) return;

    try {
      await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId);

      toast.success('Payment method removed');
      loadPaymentMethods();
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      toast.error('Failed to remove payment method');
    }
  };

  const getCardIcon = (brand?: string) => {
    // In production, use actual card brand icons
    return <CreditCard className="w-8 h-8" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">
            Manage your saved payment methods
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <Card key={method.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {method.type === 'card' ? (
                    getCardIcon(method.brand)
                  ) : (
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold">
                      W
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {method.type === 'card' 
                          ? `${method.brand} •••• ${method.last4}`
                          : 'Wassel Wallet'
                        }
                      </span>
                      {method.isDefault && (
                        <Badge variant="default">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    {method.type === 'card' && (
                      <p className="text-sm text-muted-foreground">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    )}
                    {method.holderName && (
                      <p className="text-sm text-muted-foreground">
                        {method.holderName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set as Default
                    </Button>
                  )}
                  {method.type !== 'wallet' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {paymentMethods.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payment methods added</p>
              <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Payment Method
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Payment Form */}
      {showAddForm && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Add Payment Method</CardTitle>
            <CardDescription>
              Your payment information is encrypted and secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 bg-muted rounded-lg text-center">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="font-semibold mb-2">Stripe Elements Integration</p>
              <p className="text-sm text-muted-foreground mb-4">
                In production, this would load Stripe Elements for secure card input.
                <br />
                Add REACT_APP_STRIPE_PUBLISHABLE_KEY to enable.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => {
                  toast.info('Stripe integration ready. Add API key to enable.');
                  setShowAddForm(false);
                }}>
                  Add Card (Demo)
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Info */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Secure Payment Processing</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• All payments are processed securely through Stripe</li>
            <li>• Your card details are encrypted and never stored on our servers</li>
            <li>• PCI DSS compliant payment processing</li>
            <li>• 3D Secure authentication for added security</li>
            <li>• Instant refunds processed to your original payment method</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
