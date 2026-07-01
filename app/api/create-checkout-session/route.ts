import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase-config'

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    // Server-side auth: ensure request is from an authenticated user
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        // set/remove are no-ops in this API context
        set() {},
        remove() {},
      },
    })

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user || null

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { paymentType, userEmail, userId } = await request.json();

    if (!paymentType) {
      return NextResponse.json({ error: 'Missing paymentType' }, { status: 400 });
    }

    // Ensure userId (if provided) matches authenticated user
    if (userId && userId !== user.id) {
      return NextResponse.json({ error: 'userId does not match authenticated user' }, { status: 403 })
    }

    let sessionConfig: Stripe.Checkout.SessionCreateParams;

    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=cancelled`;

    if (paymentType === 'education') {
      // Monthly subscription for Flip Academy
      sessionConfig = {
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: process.env.STRIPE_EDUCATION_PRICE_ID || 'price_education_monthly_placeholder', // Replace with your real Price ID
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userEmail,
        metadata: {
          type: 'education_subscription',
          userId: userId || 'demo',
        },
      };
    } else if (paymentType === 'ad-yearly') {
      // One-time payment for 12-month premium supplier ad
      sessionConfig = {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price: process.env.STRIPE_AD_YEARLY_PRICE_ID || 'price_ad_yearly_placeholder',
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userEmail,
        metadata: {
          type: 'ad_yearly',
          userId: userId || 'demo',
        },
      };
    } else if (paymentType === 'ad-lead') {
      // One-time per qualified lead
      sessionConfig = {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price: process.env.STRIPE_AD_LEAD_PRICE_ID || 'price_ad_lead_placeholder',
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userEmail,
        metadata: {
          type: 'ad_lead',
          userId: userId || 'demo',
        },
      };
    } else {
      return NextResponse.json({ error: 'Invalid paymentType' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}