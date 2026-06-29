'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import Link from 'next/link';

export default function BecomeSupplier() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    phone: '',
    email: '',
    website: '',
    description: '',
  });

  const categories = [
    'Plumber', 'Electrician', 'Kitchen Fitter', 'Bathroom Fitter',
    'Builder', 'Roofer', 'Painter & Decorator', 'Flooring Specialist',
    'Plasterer', 'Carpenter', 'Heating Engineer', 'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate environment
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
        throw new Error('Supabase is not properly configured. Please check your environment variables.');
      }

      // 1. Sign up user with magic link
      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email: formData.email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      // 2. Create supplier record (will be linked after they verify email)
      // For now we create it with pending status
      const { error: insertError } = await supabase.from('suppliers').insert({
        name: formData.name,
        category: formData.category,
        location: formData.location,
        phone: formData.phone,
        email: formData.email.trim(),
        website: formData.website || null,
        description: formData.description,
        status: 'pending',
      });

      if (insertError) throw insertError;

      setSubmitted(true);
      toast.success('Application submitted!', {
        description: 'Check your email for a magic link to complete your registration.',
      });

    } catch (error: any) {
      console.error('Supplier signup error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.message?.includes('Supabase')) {
        errorMessage = error.message;
      } else if (error.message?.includes('rate')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('already')) {
        errorMessage = 'This email is already registered.';
      } else if (error.status === 0 || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight mb-4">Application Received</h1>
          <p className="text-white/70 mb-6">
            We've sent a magic link to <strong>{formData.email}</strong>. 
            Click it to verify your email and access your supplier dashboard.
          </p>
          <p className="text-white/50 text-sm">
            Your application is currently under review. You'll be notified once approved.
          </p>
          <Link href="/" className="mt-8 inline-block text-[#D4AF37] hover:underline">
            ← Back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <Link href="/" className="text-white/60 hover:text-white text-sm">← Back to Flip Property Coach</Link>
          <h1 className="text-5xl font-semibold tracking-tight mt-4">Become a Supplier</h1>
          <p className="text-white/60 mt-2 text-lg">
            Join the network trusted by property flippers across the UK.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Business / Trading Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="ABC Plumbing Ltd"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input w-full"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location / Coverage Area *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="input w-full"
                placeholder="Manchester, Greater Manchester"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Website (optional)</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="input w-full"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input w-full"
              placeholder="you@business.com"
            />
            <p className="text-xs text-white/50 mt-1">We'll send you a magic link to verify and access your dashboard.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Short Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="input w-full resize-y"
              placeholder="Tell flippers what you specialise in and why they should work with you..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-lg mt-4"
          >
            {loading ? 'Submitting Application...' : 'Submit Application'}
          </button>

          <p className="text-center text-xs text-white/50 mt-4">
            Your application will be reviewed. Approved suppliers get access to the Supplier Dashboard.
          </p>
        </form>
      </div>
    </div>
  );
}
