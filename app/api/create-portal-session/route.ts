import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr'
import { paymentLimiter } from '@/lib/rate-limiter'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/lib/supabase-config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {},
        remove() {},
      },
    })
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user || null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { customerId } = await request.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Missing customerId' }, { status: 400 });
    }

    // Rate limit
    const rl = await paymentLimiter.take(user.id)
    if (rl.remaining < 0) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetMs || 0)/1000)) } })
    }

    // Best-effort: ensure the customer belongs to the user by checking Stripe customer metadata in DB
    // If you have a customers table linking supabase user id to stripe customer id, validate here.

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error('Portal session error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}