'use client';

import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { formatCooldownMessage, getMagicLinkCooldownRemaining, markMagicLinkRequested } from '@/lib/magic-link';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    const emailValue = email.trim();
    const cooldownRemaining = getMagicLinkCooldownRemaining(emailValue);
    if (cooldownRemaining > 0) {
      toast.error(formatCooldownMessage(cooldownRemaining));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: emailValue,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      markMagicLinkRequested(emailValue);
      setMagicLinkSent(true);
      toast.success('Magic link sent! Check your inbox (and spam folder).');
    } catch (err: any) {
      console.error('Magic link error:', err);
      
      let errorMessage = 'Failed to send magic link. Please try again.';
      
      if (err.message?.includes('Supabase')) {
        errorMessage = err.message;
      } else if (err.message?.includes('rate')) {
        markMagicLinkRequested(emailValue);
        errorMessage = formatCooldownMessage(getMagicLinkCooldownRemaining(emailValue) || 60_000);
      } else if (err.message?.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.status === 0 || err.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    // Demo mode: just go to dashboard. The dashboard already auto-logs demo users.
    window.location.href = '/dashboard';
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F59E0B] flex items-center justify-center mb-8">
            <CheckCircle className="w-10 h-10 text-[#0F172A]" />
          </div>
          
          <h1 className="text-4xl font-semibold tracking-tight mb-4">Check your email</h1>
          <p className="text-white/70 text-lg mb-2">
            We sent a magic link to <span className="font-medium text-white">{email}</span>
          </p>
          <p className="text-white/50 mb-8">
            Click the link in the email to sign in instantly. It works on any device.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setMagicLinkSent(false);
                setEmail('');
              }}
              className="w-full py-3.5 rounded-2xl border border-white/20 hover:bg-white/5 transition-colors font-medium"
            >
              Send another link
            </button>
            
            <button
              onClick={handleDemoMode}
              className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors font-medium"
            >
              Continue in Demo Mode instead
            </button>
          </div>

          <p className="text-xs text-white/40 mt-8">
            Didn&apos;t receive it? Check your spam folder or try a different email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Top bar */}
      <div className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="FLIP Property Coach" 
              className="h-9 w-auto" 
            />
          </Link>
          <Link href="/" className="text-sm text-white/60 hover:text-white flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 pt-16 pb-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm mb-6">
            <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            Trusted by 1,200+ property flippers
          </div>
          
          <h1 className="text-5xl font-semibold tracking-tighter mb-4">Welcome back</h1>
          <p className="text-xl text-white/70">Sign in to your Flip Property Coach account</p>
        </div>

        {/* Magic Link Form */}
        <div className="bg-[#1E2937] border border-white/10 rounded-3xl p-8 mb-6">
          <form onSubmit={handleMagicLink} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourcompany.com"
                  className="w-full bg-[#0F172A] border border-white/20 focus:border-[#D4AF37] rounded-2xl pl-12 pr-4 py-3.5 text-lg placeholder:text-white/40 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-3 bg-[#D4AF37] hover:bg-[#F59E0B] active:bg-[#D4AF37] text-[#0F172A] font-semibold text-lg py-4 rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending magic link...
                </>
              ) : (
                'Send Magic Link'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-white/50">
              We&apos;ll email you a secure one-click sign-in link.<br />No password needed.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/40 text-sm">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Demo Mode - Flipper */}
        <button
          onClick={handleDemoMode}
          className="w-full flex flex-col items-center justify-center gap-2 border border-white/20 hover:bg-white/5 active:bg-white/10 transition-all rounded-3xl py-6 group mb-3"
        >
          <div className="font-semibold text-lg group-hover:text-[#D4AF37] transition-colors">Continue in Demo Mode (Flipper)</div>
          <div className="text-sm text-white/60">Try the full flipper experience • Projects, cashflow, team builder</div>
        </button>

        {/* Demo Mode - Supplier */}
        <button
          onClick={() => window.location.href = '/supplier-dashboard'}
          className="w-full flex flex-col items-center justify-center gap-2 border border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 active:bg-[#D4AF37]/10 transition-all rounded-3xl py-6 group"
        >
          <div className="font-semibold text-lg group-hover:text-[#D4AF37] transition-colors">Continue as Supplier Demo</div>
          <div className="text-sm text-white/60">Manage listings • View leads • Buy premium ad space • See performance</div>
        </button>

        {/* Demo Mode - Admin */}
        <button
          onClick={() => window.location.href = '/admin'}
          className="w-full flex flex-col items-center justify-center gap-2 border border-red-500/40 hover:bg-red-500/5 active:bg-red-500/10 transition-all rounded-3xl py-6 group mt-3"
        >
          <div className="font-semibold text-lg group-hover:text-red-400 transition-colors">Continue as Admin Demo</div>
          <div className="text-sm text-white/60">Command centre • Approve suppliers • Manage users • Revenue overview • Content control</div>
        </button>

        <p className="text-center text-xs text-white/40 mt-8 max-w-xs mx-auto">
          Demo mode uses your browser storage only. Create a real account to sync across devices, save projects permanently, and unlock team features.
        </p>
      </div>
    </div>
  );
}
