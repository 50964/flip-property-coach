'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, Target, PoundSterling, Edit2, Save, Eye, MessageCircle, 
  ArrowLeft, LogOut, Award, BarChart3, Calendar, Plus, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase';
import * as SupabaseData from '@/lib/supabase-data';
import type { SupplierListing, Lead } from '@/types';
import NotificationBell from '@/components/NotificationBell';
import PushNotificationManager from '@/components/PushNotificationManager';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

// Demo mock data (used when isDemoMode = true)
const DEMO_LISTING: SupplierListing = {
  id: 's1',
  name: 'Premier Builders Ltd',
  category: 'Builder',
  description: 'Award-winning building contractor specialising in property flips and renovations across the North West. 15+ years experience, fully insured, 5-star rated on Checkatrade.',
  location: 'Manchester & North West',
  price_range: '£180-280/day or fixed project quotes',
  contact_email: 'hello@premierbuilders.co.uk',
  contact_phone: '0161 555 0192',
};

const DEMO_LEADS: Lead[] = [
  { id: 'l1', supplier_id: 's1', flipper_name: 'Sarah Patel', project: '42 Maple Grove, Leeds', message: 'Hi, looking for a reliable builder for a full flip. Kitchen + bathroom + structural. Can you quote?', status: 'new', created_at: '2026-06-17T10:00:00Z' },
  { id: 'l2', supplier_id: 's1', flipper_name: 'James Wilson', project: '17 Oak Street, Manchester', message: 'Need electrician + builder team for 3-bed flip. Quick turnaround preferred.', status: 'contacted', created_at: '2026-06-16T14:30:00Z' },
  { id: 'l3', supplier_id: 's1', flipper_name: 'Aisha Khan', project: '9 Victoria Road, Liverpool', message: 'Roofer needed urgently for leak repair + full re-roof on flip project.', status: 'quoted', created_at: '2026-06-15T09:15:00Z' },
  { id: 'l4', supplier_id: 's1', flipper_name: 'Tom Richards', project: '55 Park Lane, Sheffield', message: 'Interested in your full renovation package for our latest flip.', status: 'new', created_at: '2026-06-14T16:45:00Z' },
];

const DEMO_AD_METRICS = {
  impressions: 48200,
  clicks: 1240,
  ctr: 2.57,
  leads: 14,
  revenue: 6840,
};

export default function SupplierDashboard() {
  const supabase = createClient();

  // Auth & Mode
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Real data states
  const [listing, setListing] = useState<SupplierListing | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hasListing, setHasListing] = useState(false);

  // UI states
  const [isEditingListing, setIsEditingListing] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isCreatingListing, setIsCreatingListing] = useState(false);

  // Form state for editing / creating
  const [formData, setFormData] = useState<Partial<SupplierListing>>({});

  // Ad metrics (demo or could be extended)
  const adMetrics = DEMO_AD_METRICS;

  const adStatus = {
    active: true,
    plan: 'Premium Annual',
    expires: '12 December 2026',
    spot: 'Homepage Premium Banner + Category Top Spot'
  };

  // Load real data when not in demo mode
  const loadRealData = async (uid: string) => {
    setIsLoading(true);
    try {
      const myListing = await SupabaseData.getMySupplierListing(uid);
      
      if (myListing) {
        setListing(myListing);
        setHasListing(true);
        setFormData(myListing);
        
        const myLeads = await SupabaseData.getLeadsForSupplier(myListing.id);
        setLeads(myLeads);
      } else {
        const pendingDraftRaw =
          typeof window !== 'undefined'
            ? window.localStorage.getItem('flip_pending_supplier_application')
            : null;

        if (pendingDraftRaw) {
          const pendingDraft = JSON.parse(pendingDraftRaw);
          const createdListing = await SupabaseData.createOrUpdateSupplierListing(uid, pendingDraft);

          if (createdListing) {
            window.localStorage.removeItem('flip_pending_supplier_application');
            setListing(createdListing);
            setHasListing(true);
            setFormData(createdListing);
            setLeads([]);
            setIsCreatingListing(false);
            return;
          }
        }

        setListing(null);
        setHasListing(false);
        setLeads([]);
        // Start with empty form for creation
        setFormData({
          name: '',
          category: 'Builder',
          description: '',
          location: '',
          price_range: '',
          contact_email: '',
          contact_phone: '',
        });
        setIsCreatingListing(true);
      }
    } catch (error) {
      console.error('Error loading supplier data:', error);
      toast.error('Failed to load your supplier data');
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth on mount (same pattern as main dashboard)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) console.error("Supplier Auth Error:", error);
        
        if (session?.user) {
          setIsDemoMode(false);
          setUserId(session.user.id);
          await loadRealData(session.user.id);
        } else {
          setIsDemoMode(true);
          setListing(DEMO_LISTING);
          setLeads(DEMO_LEADS);
          setHasListing(true);
          setFormData(DEMO_LISTING);
        }
      } catch (err) {
        console.error("Supplier checkAuth crash:", err);
        setIsDemoMode(true);
        setListing(DEMO_LISTING);
        setLeads(DEMO_LEADS);
        setHasListing(true);
        setFormData(DEMO_LISTING);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsDemoMode(false);
        setUserId(session.user.id);
        await loadRealData(session.user.id);
      }
      if (event === 'SIGNED_OUT') {
        setIsDemoMode(true);
        setUserId(null);
        setListing(DEMO_LISTING);
        setLeads(DEMO_LEADS);
        setHasListing(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save listing (create or update)
  const handleSaveListing = async () => {
    if (!formData.name || !formData.category) {
      toast.error('Please fill in Company Name and Category');
      return;
    }

    if (isDemoMode) {
      // Demo mode — just update local state
      const updated = { ...DEMO_LISTING, ...formData } as SupplierListing;
      setListing(updated);
      setFormData(updated);
      setIsEditingListing(false);
      setIsCreatingListing(false);
      toast.success('Listing updated successfully!', {
        description: 'Your changes are now live in the marketplace (demo).'
      });
      return;
    }

    // Real mode
    if (!userId) return;

    setIsLoading(true);
    try {
      const saved = await SupabaseData.createOrUpdateSupplierListing(userId, {
        ...formData,
        id: listing?.id,
      });

      if (saved) {
        setListing(saved);
        setFormData(saved);
        setHasListing(true);
        setIsEditingListing(false);
        setIsCreatingListing(false);
        
        toast.success('Listing saved to Supabase!', {
          description: 'Your marketplace listing is now live and visible to flippers.'
        });

        // Reload leads in case
        if (saved.id) {
          const updatedLeads = await SupabaseData.getLeadsForSupplier(saved.id);
          setLeads(updatedLeads);
        }
      } else {
        toast.error('Failed to save listing');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error saving listing');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactLead = (lead: Lead) => {
    setSelectedLead(lead);
    setReplyMessage(lead.reply_message || '');
  };

  const sendReply = async () => {
    if (!selectedLead || !replyMessage.trim()) return;

    if (isDemoMode) {
      setLeads(prev => prev.map(l => 
        l.id === selectedLead.id ? { ...l, status: 'contacted' as const, reply_message: replyMessage } : l
      ));
      toast.success(`Reply sent to ${selectedLead.flipper_name}`, {
        description: 'They will receive your message and contact details (demo).'
      });
    } else {
      const success = await SupabaseData.updateLeadStatus(
        selectedLead.id, 
        'contacted', 
        replyMessage
      );
      
      if (success) {
        setLeads(prev => prev.map(l => 
          l.id === selectedLead.id ? { ...l, status: 'contacted' as const, reply_message: replyMessage } : l
        ));
        toast.success(`Reply sent to ${selectedLead.flipper_name}`);
      } else {
        toast.error('Failed to update lead');
      }
    }

    setSelectedLead(null);
    setReplyMessage('');
  };

  const handleBuyAd = async () => {
    if (isDemoMode) {
      toast.success('Stripe Checkout would open here', {
        description: 'In production: redirects to real Stripe for £1,200 annual premium ad.'
      });
      setTimeout(() => {
        toast.success('Ad renewed successfully!', {
          description: 'Your premium placement is now active until Dec 2027.'
        });
      }, 1200);
    } else {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentType: 'ad-yearly',
            userEmail: currentUser?.email || '',
            userId: currentUser?.id || '',
          }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Failed to start checkout');
        }
      } catch (err) {
        toast.error('Could not start payment. Please try again.');
        console.error(err);
      }
    }
  };

  const handleAddTestLead = async () => {
    if (isDemoMode || !listing) return;

    const newLead = await SupabaseData.createTestLead(listing.id);
    if (newLead) {
      setLeads(prev => [newLead, ...prev]);
      toast.success('Test lead added!', {
        description: 'This simulates a new enquiry from a flipper.'
      });
    }
  };

  const handleSwitchToFlipper = () => {
    window.location.href = '/dashboard';
  };

  const handleLogout = async () => {
    if (!isDemoMode) {
      await supabase.auth.signOut();
    }
    window.location.href = '/login';
  };

  // Current listing to display (real or demo)
  const currentListing = listing || formData as SupplierListing;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {/* Top Navigation */}
      <nav className="border-b border-white/10 bg-[#0F172A]/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <img 
                src="/icons/logos/logo-gold-512.jpg" 
                alt="FLIP Property Coach" 
                className="h-9 w-auto" 
              />
              <span className="text-[#D4AF37] text-sm font-mono tracking-[3px] ml-1">SUPPLIER</span>
            </Link>
            <div className="h-6 w-px bg-white/20 mx-2" />
            <span className="text-white/60 text-sm">Supplier Hub</span>
          </div>

          <div className="flex items-center gap-4">
            {isDemoMode && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-mono tracking-wider text-white/70">
                <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse" />
                SUPPLIER DEMO
              </div>
            )}

            <NotificationBell 
              userId={isDemoMode ? null : userId} 
              role="supplier" 
              supplierId={isDemoMode ? null : listing?.id}
            />

            <PushNotificationManager userId={isDemoMode ? null : userId} />
            
            <button
              onClick={handleSwitchToFlipper}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/5 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Flipper Dashboard
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tighter">
              Welcome back, {currentListing?.name || 'Supplier'}
            </h1>
            <p className="text-white/60 mt-1">Your marketplace performance • Last 30 days</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/50">Account since</div>
            <div className="font-medium">March 2025 • Verified Supplier</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Listings', value: hasListing ? '1' : '0', icon: Award, change: hasListing ? 'Live in marketplace' : 'Create your listing below' },
            { label: 'Leads This Month', value: leads.length.toString(), icon: Users, change: '+23% vs last month' },
            { label: 'Ad Impressions', value: (adMetrics.impressions / 1000).toFixed(1) + 'k', icon: Eye, change: 'Premium spot performing well' },
            { label: 'Revenue from Leads', value: '£' + adMetrics.revenue.toLocaleString(), icon: PoundSterling, change: `${leads.length} qualified leads` },
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-5 h-5 text-[#D4AF37]" />
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono tracking-wider">LIVE</span>
              </div>
              <div className="text-4xl font-semibold tracking-tighter mb-1">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
              <div className="text-emerald-400 text-xs mt-2">{stat.change}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* My Service Listing */}
          <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">My Marketplace Listing</h2>
                <p className="text-white/60 text-sm">
                  {hasListing 
                    ? `Visible to all flippers searching for ${currentListing?.category?.toLowerCase() || 'services'}`
                    : 'Create your listing to appear in the FIND marketplace'
                  }
                </p>
              </div>
              
              {!isEditingListing && !isCreatingListing ? (
                <button 
                  onClick={() => {
                    if (currentListing) setFormData(currentListing);
                    setIsEditingListing(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/5 text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" /> Edit Listing
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setIsEditingListing(false);
                      setIsCreatingListing(false);
                      if (listing) setFormData(listing);
                    }}
                    className="px-4 py-2 rounded-2xl border border-white/20 text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveListing}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-[#D4AF37] text-[#0F172A] font-semibold text-sm hover:bg-[#F59E0B] transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Create Listing Prompt (real mode, no listing yet) */}
            {!hasListing && !isDemoMode && !isEditingListing && !isCreatingListing && (
              <div className="text-center py-8 border border-dashed border-white/20 rounded-2xl">
                <Award className="w-12 h-12 mx-auto text-[#D4AF37] mb-4" />
                <h3 className="text-xl font-semibold mb-2">You don&apos;t have a listing yet</h3>
                <p className="text-white/60 mb-6 max-w-md mx-auto">
                  Create your professional listing and start receiving qualified leads from flippers across the UK.
                </p>
                <button
                  onClick={() => setIsCreatingListing(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#D4AF37] text-[#0F172A] font-semibold hover:bg-[#F59E0B]"
                >
                  <Plus className="w-4 h-4" /> Create My Marketplace Listing
                </button>
              </div>
            )}

            {/* Listing Form / Display */}
            {(isEditingListing || isCreatingListing || hasListing) && (
              <div className="space-y-5">
                {/* Company Name */}
                <div>
                  <label className="text-xs uppercase tracking-[1.5px] text-white/50 block mb-1.5">Company / Trading Name</label>
                  {isEditingListing || isCreatingListing ? (
                    <input 
                      type="text" 
                      value={formData.name || ''} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-lg font-medium focus:outline-none focus:border-[#D4AF37]"
                      placeholder="Premier Builders Ltd"
                    />
                  ) : (
                    <div className="text-2xl font-semibold tracking-tight">{currentListing?.name}</div>
                  )}
                </div>

                {/* Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs uppercase tracking-[1.5px] text-white/50 block mb-1.5">Category</label>
                    {isEditingListing || isCreatingListing ? (
                      <select 
                        value={formData.category || 'Builder'} 
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-lg focus:outline-none focus:border-[#D4AF37]"
                      >
                        {['Builder', 'Electrician', 'Plumber', 'Roofer', 'Plasterer', 'Kitchen Fitter', 'Decorator', 'Other'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium">{currentListing?.category}</div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-[1.5px] text-white/50 block mb-1.5">Location / Coverage</label>
                    {isEditingListing || isCreatingListing ? (
                      <input 
                        type="text" 
                        value={formData.location || ''} 
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                        placeholder="Manchester & North West"
                      />
                    ) : (
                      <div className="text-lg">{currentListing?.location}</div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs uppercase tracking-[1.5px] text-white/50 block mb-1.5">Description</label>
                  {isEditingListing || isCreatingListing ? (
                    <textarea 
                      value={formData.description || ''} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#D4AF37] resize-y"
                      placeholder="Describe your services, experience, and what makes you stand out..."
                    />
                  ) : (
                    <p className="text-white/80 leading-relaxed">{currentListing?.description}</p>
                  )}
                </div>

                {/* Price Range & Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs uppercase tracking-[1.5px] text-white/50 block mb-1.5">Pricing / Rate</label>
                    {isEditingListing || isCreatingListing ? (
                      <input 
                        type="text" 
                        value={formData.price_range || ''} 
                        onChange={e => setFormData({...formData, price_range: e.target.value})}
                        className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                        placeholder="£180-280/day or fixed project quotes"
                      />
                    ) : (
                      <div className="text-lg font-medium">{currentListing?.price_range}</div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-[1.5px] text-white/50 block mb-1.5">Contact Phone</label>
                    {isEditingListing || isCreatingListing ? (
                      <input 
                        type="text" 
                        value={formData.contact_phone || ''} 
                        onChange={e => setFormData({...formData, contact_phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                      />
                    ) : (
                      <div className="text-lg">{currentListing?.contact_phone}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[1.5px] text-white/50 block mb-1.5">Contact Email</label>
                  {isEditingListing || isCreatingListing ? (
                    <input 
                      type="email" 
                      value={formData.contact_email || ''} 
                      onChange={e => setFormData({...formData, contact_email: e.target.value})}
                      className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#D4AF37]"
                    />
                  ) : (
                    <div className="text-lg">{currentListing?.contact_email}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Premium Ad Performance */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Premium Ad Performance</h2>
                <p className="text-white/60 text-sm">Homepage banner + category top spot</p>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono">ACTIVE</div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-semibold tracking-tighter">{(adMetrics.impressions / 1000).toFixed(1)}k</div>
                  <div className="text-xs text-white/50">IMPRESSIONS</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold tracking-tighter">{adMetrics.ctr}%</div>
                  <div className="text-xs text-white/50">CLICK-THROUGH RATE</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold tracking-tighter">{adMetrics.leads}</div>
                  <div className="text-xs text-white/50">QUALIFIED LEADS</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold tracking-tighter">£{adMetrics.revenue.toLocaleString()}</div>
                  <div className="text-xs text-white/50">REVENUE GENERATED</div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-white/60">Plan</span>
                  <span className="font-medium">{adStatus.plan}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-white/60">Active until</span>
                  <span className="font-medium text-emerald-400">{adStatus.expires}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-white/60">Placement</span>
                  <span className="font-medium text-right text-xs leading-tight">{adStatus.spot}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleBuyAd}
              className="mt-6 w-full py-3.5 rounded-2xl bg-[#D4AF37] hover:bg-[#F59E0B] text-[#0F172A] font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Target className="w-4 h-4" /> Renew Premium Ad – £1,200/year
            </button>
            <p className="text-center text-[10px] text-white/40 mt-2">One-time annual payment • Cancel anytime</p>
          </div>

          {/* Leads Inbox */}
          <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Leads Inbox</h2>
                <p className="text-white/60 text-sm">Enquiries from flippers looking for your services</p>
              </div>
              {!isDemoMode && hasListing && (
                <button 
                  onClick={handleAddTestLead}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/5 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> Add Test Lead
                </button>
              )}
            </div>

            {leads.length === 0 ? (
              <div className="text-center py-12 text-white/50">
                No leads yet. Your listing is live — flippers will start reaching out soon.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs uppercase tracking-widest text-white/50">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Flipper</th>
                      <th className="pb-3 pr-4">Project</th>
                      <th className="pb-3 pr-4">Message</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-sm">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 pr-4 text-white/60 whitespace-nowrap">
                          {new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="py-4 pr-4 font-medium">{lead.flipper_name}</td>
                        <td className="py-4 pr-4 text-white/70 max-w-[180px] truncate">{lead.project}</td>
                        <td className="py-4 pr-4 text-white/70 max-w-[320px] truncate">{lead.message}</td>
                        <td className="py-4 pr-4">
                          <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium ${
                            lead.status === 'new' ? 'bg-blue-500/10 text-blue-400' :
                            lead.status === 'contacted' ? 'bg-amber-500/10 text-amber-400' :
                            lead.status === 'quoted' ? 'bg-emerald-500/10 text-emerald-400' :
                            'bg-white/10 text-white/60'
                          }`}>
                            {lead.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => handleContactLead(lead)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-white/20 hover:bg-white/5 text-xs font-medium"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Reply
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-[#0F172A] border border-white/10 rounded-3xl w-full max-w-lg p-8">
            <h3 className="text-2xl font-semibold tracking-tight mb-1">Reply to {selectedLead.flipper_name}</h3>
            <p className="text-white/60 text-sm mb-6">Project: {selectedLead.project}</p>

            <div className="mb-6 p-4 bg-white/5 rounded-2xl text-sm text-white/80 border-l-4 border-[#D4AF37]">
              {selectedLead.message}
            </div>

            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Hi Sarah, thanks for reaching out. I'd be happy to quote on this project. When would be a good time for a quick call?"
              rows={5}
              className="w-full bg-white/5 border border-white/20 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] mb-6"
            />

            <div className="flex gap-3">
              <button 
                onClick={() => { setSelectedLead(null); setReplyMessage(''); }}
                className="flex-1 py-3 rounded-2xl border border-white/20 text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={sendReply}
                disabled={!replyMessage.trim()}
                className="flex-1 py-3 rounded-2xl bg-[#D4AF37] text-[#0F172A] font-semibold text-sm disabled:opacity-50"
              >
                Send Reply & Mark as Contacted
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
