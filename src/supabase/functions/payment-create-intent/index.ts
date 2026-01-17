/**
 * Supabase Edge Function: Create Payment Intent
 * 
 * Handles Stripe payment intent creation for trip payments
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.10.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, currency, tripId, customerId, metadata } = await req.json();

    // Validate input
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!currency) {
      throw new Error('Currency is required');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: {
        tripId,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Wassel Trip Payment - ${tripId}`,
    });

    return new Response(
      JSON.stringify({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Payment intent creation failed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
