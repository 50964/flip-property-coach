'use client';

import React, { useState, useEffect } from 'react';
import {
  adminMetrics,
  adminSuppliers,
  adminUsers,
  adminLeads,
  adminRevenue,
  updateSupplierStatus,
  toggleFeatured,
  updateUserStatus,
  type AdminSupplier,
  type AdminUser,
} from '@/lib/admin-mock-data';

type Tab = 'overview' | 'suppliers' | 'users' | 'leads' | 'revenue' | 'educate';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [suppliers, setSuppliers] = useState(adminSuppliers);
  const [users, setUsers] = useState(adminUsers);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auth guard — redirect non-admin users
  useEffect(() => {
    import('@/lib/supabase').then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) {
          window.location.href = '/login';
          return;
        }
        supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
          .then(({ data: profile }: { data: { role: string } | null }) => {
            if (!profile || profile.role !== 'admin') {
              window.location.href = '/dashboard';
            }
          });
      });
    });
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  };

  // === SUPPLIER ACTIONS ===
  const handleApprove = (id: string) => {
    const updated = updateSupplierStatus(id, 'approved');
    setSuppliers([...updated]);
    showToast('Supplier approved and now live in marketplace');
  };

  const handleReject = (id: string) => {
    const updated = updateSupplierStatus(id, 'rejected');
    setSuppliers([...updated]);
    showToast('Supplier rejected', 'error');
  };

  const handleToggleFeatured = (id: string) => {
    const updated = toggleFeatured(id);
    setSuppliers([...updated]);
    const s = updated.find(x => x.id === id);
    showToast(s?.is_featured ? 'Supplier now featured in FIND results' : 'Supplier removed from featured');
  };

  const handleSuspendSupplier = (id: string) => {
    const updated = updateSupplierStatus(id, 'suspended');
    setSuppliers([...updated]);
    showToast('Supplier suspended from marketplace', 'error');
  };

  // === USER ACTIONS ===
  const handleSuspendUser = (id: string) => {
    const updated = updateUserStatus(id, 'suspended');
    setUsers([...updated]);
    showToast('User account suspended', 'error');
  };

  const handleReactivateUser = (id: string) => {
    const updated = updateUserStatus(id, 'active');
    setUsers([...updated]);
    showToast('User account reactivated');
  };

  const pendingSuppliers = suppliers.filter(s => s.status === 'pending');
  const activeSuppliers = suppliers.filter(s => s.status === 'approved' || s.status === 'suspended');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Admin Bar */}
      <div className="border-b border-white/10 bg-[#111] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/icons/logos/logo-gold-512.jpg" 
                alt="FLIP Property Coach" 
                className="h-9 w-auto" 
              />
              <div>
                <div className="font-semibold tracking-tight text-xl">Flip Property Coach</div>
                <div className="text-[10px] text-white/50 -mt-1">ADMIN PANEL</div>
              </div>
            </div>
            <div className="ml-4 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-mono tracking-widest border border-red-500/30">
              DEMO MODE — NOT PRODUCTION
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="text-white/60">admin@flippropertycoach.co.uk</div>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 rounded-xl border border-white/20 hover:bg-white/5 transition text-sm"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('flip_demo_user');
                window.location.href = '/login';
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tighter">Command Centre</h1>
            <p className="text-white/60 mt-1">Monitor, manage and grow Flip Property Coach</p>
          </div>
          <div className="text-right text-sm text-white/50">
            Last updated: just now • {new Date().toLocaleDateString('en-GB')}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-white/10 pb-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'suppliers', label: 'Suppliers' },
            { id: 'users', label: 'Users' },
            { id: 'leads', label: 'Leads' },
            { id: 'revenue', label: 'Revenue' },
            { id: 'educate', label: 'Educate Content' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-6 py-2.5 rounded-t-2xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#111] text-white border-b-2 border-[#D4AF37]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========== OVERVIEW ========== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {adminMetrics.map((metric, idx) => (
                <div key={idx} className="bg-[#111] border border-white/10 rounded-3xl p-5">
                  <div className="text-white/60 text-sm mb-1">{metric.label}</div>
                  <div className="text-3xl font-semibold tracking-tighter mb-2">{metric.value}</div>
                  <div className={`text-xs flex items-center gap-1 ${
                    metric.trend === 'up' ? 'text-emerald-400' : metric.trend === 'down' ? 'text-red-400' : 'text-white/50'
                  }`}>
                    {metric.change}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Charts + Activity */}
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Revenue Breakdown */}
              <div className="lg:col-span-3 bg-[#111] border border-white/10 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="font-semibold">Revenue Breakdown (This Month)</div>
                  <div className="text-xs text-white/50">£49,420 total</div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Education Subscriptions (MRR)</span>
                      <span className="font-mono">£28,900</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-2 w-[58%] bg-[#D4AF37]" /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Yearly Ad Placements</span>
                      <span className="font-mono">£14,400</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-2 w-[29%] bg-emerald-500" /></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Per-Lead Fees</span>
                      <span className="font-mono">£6,120</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-2 w-[12%] bg-blue-500" /></div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-3xl p-6">
                <div className="font-semibold mb-4">Recent Platform Activity</div>
                <div className="space-y-3 text-sm">
                  {[
                    { time: '2m ago', text: 'New supplier application: Precision Tiling' },
                    { time: '14m ago', text: 'Alex Thompson sent enquiry to NorthWest Renovations' },
                    { time: '47m ago', text: 'New education subscription started' },
                    { time: '1h ago', text: 'Supplier SparkRight replied to lead #902' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 text-white/70">
                      <div className="font-mono text-[10px] text-white/40 w-12 shrink-0">{item.time}</div>
                      <div>{item.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#111] border border-white/10 rounded-3xl p-6">
              <div className="font-semibold mb-4">Quick Admin Actions</div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setActiveTab('suppliers')} className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm">Review 7 Pending Suppliers →</button>
                <button onClick={() => setActiveTab('revenue')} className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm">View Full Revenue Report</button>
                <button onClick={() => setActiveTab('educate')} className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm">Manage Flip Academy Content</button>
              </div>
            </div>
          </div>
        )}

        {/* ========== SUPPLIERS TAB ========== */}
        {activeTab === 'suppliers' && (
          <div className="space-y-8">
            {/* Pending Approvals */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-xl">Pending Approvals <span className="text-red-400">({pendingSuppliers.length})</span></div>
                <div className="text-xs text-white/50">New suppliers must be manually approved before appearing in FIND</div>
              </div>

              {pendingSuppliers.length === 0 ? (
                <div className="bg-[#111] border border-white/10 rounded-3xl p-8 text-center text-white/50">No pending applications right now.</div>
              ) : (
                <div className="grid gap-4">
                  {pendingSuppliers.map((s) => (
                    <div key={s.id} className="bg-[#111] border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg">{s.company_name}</div>
                        <div className="text-white/60 text-sm">{s.category} • {s.location} • Applied {new Date(s.joined).toLocaleDateString('en-GB')}</div>
                        <div className="text-xs text-white/40 mt-1">{s.email}</div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleApprove(s.id)} className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-sm font-medium">Approve & Go Live</button>
                        <button onClick={() => handleReject(s.id)} className="px-6 py-2.5 rounded-2xl border border-white/20 hover:bg-white/5 text-sm">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All Active Suppliers */}
            <div>
              <div className="font-semibold text-xl mb-4">All Marketplace Suppliers ({activeSuppliers.length})</div>
              <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/10 text-white/60">
                    <tr>
                      <th className="text-left p-4 font-normal">Company</th>
                      <th className="text-left p-4 font-normal">Category</th>
                      <th className="text-left p-4 font-normal">Location</th>
                      <th className="text-center p-4 font-normal">Status</th>
                      <th className="text-center p-4 font-normal">Featured</th>
                      <th className="text-right p-4 font-normal">Leads</th>
                      <th className="text-right p-4 font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {activeSuppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5">
                        <td className="p-4 font-medium">{s.company_name}</td>
                        <td className="p-4 text-white/70">{s.category}</td>
                        <td className="p-4 text-white/70">{s.location}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-mono tracking-wider ${
                            s.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                            s.status === 'suspended' ? 'bg-red-500/20 text-red-400' : ''
                          }`}>
                            {s.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button onClick={() => handleToggleFeatured(s.id)} className={`text-xs px-3 py-1 rounded-full border ${s.is_featured ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-white/20 text-white/40'}`}>
                            {s.is_featured ? '★ Featured' : 'Not featured'}
                          </button>
                        </td>
                        <td className="p-4 text-right font-mono text-white/70">{s.total_leads}</td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {s.status === 'approved' && (
                              <button onClick={() => handleSuspendSupplier(s.id)} className="text-xs px-4 py-1.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10">Suspend</button>
                            )}
                            {s.status === 'suspended' && (
                              <button onClick={() => handleApprove(s.id)} className="text-xs px-4 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10">Reactivate</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========== USERS TAB ========== */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="font-semibold text-xl">Platform Users ({users.length})</div>
              <input type="text" placeholder="Search name or email..." className="bg-[#111] border border-white/10 rounded-2xl px-4 py-2 text-sm w-72 placeholder:text-white/40" />
            </div>

            <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 text-white/60">
                  <tr>
                    <th className="text-left p-4 font-normal">Name / Company</th>
                    <th className="text-left p-4 font-normal">Email</th>
                    <th className="text-center p-4 font-normal">Role</th>
                    <th className="text-center p-4 font-normal">Status</th>
                    <th className="text-center p-4 font-normal">Projects</th>
                    <th className="text-right p-4 font-normal">Last Active</th>
                    <th className="text-right p-4 font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/5">
                      <td className="p-4 font-medium">{u.name}</td>
                      <td className="p-4 text-white/70 font-mono text-xs">{u.email}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-0.5 rounded-full text-xs ${u.role === 'flipper' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-0.5 rounded-full text-xs font-mono tracking-wider ${u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {u.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono text-white/70">{u.projects}</td>
                      <td className="p-4 text-right text-white/60 text-xs">{u.last_active}</td>
                      <td className="p-4 text-right">
                        {u.status === 'active' ? (
                          <button onClick={() => handleSuspendUser(u.id)} className="text-xs px-4 py-1.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10">Suspend</button>
                        ) : (
                          <button onClick={() => handleReactivateUser(u.id)} className="text-xs px-4 py-1.5 rounded-xl border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10">Reactivate</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-white/40 text-xs mt-4">In production: Impersonate button, full activity history, internal notes, CSV export</p>
          </div>
        )}

        {/* ========== LEADS TAB ========== */}
        {activeTab === 'leads' && (
          <div>
            <div className="font-semibold text-xl mb-4">Platform-Wide Leads & Enquiries</div>
            <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-white/10 text-white/60">
                  <tr>
                    <th className="text-left p-4 font-normal">Date</th>
                    <th className="text-left p-4 font-normal">Flipper</th>
                    <th className="text-left p-4 font-normal">Supplier</th>
                    <th className="text-left p-4 font-normal">Project</th>
                    <th className="text-center p-4 font-normal">Status</th>
                    <th className="text-left p-4 font-normal">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {adminLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/5">
                      <td className="p-4 text-white/60 text-xs font-mono">{lead.date}</td>
                      <td className="p-4 font-medium">{lead.flipper_name}</td>
                      <td className="p-4 text-white/80">{lead.supplier_name}</td>
                      <td className="p-4 text-white/70 text-xs">{lead.project}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-0.5 rounded-full text-xs font-mono tracking-wider ${
                          lead.status === 'new' ? 'bg-blue-500/20 text-blue-400' :
                          lead.status === 'quoted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'
                        }`}>
                          {lead.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-white/60 text-xs max-w-[280px] truncate">{lead.message_preview}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-center text-white/40 text-xs mt-4">Production version would include full thread view, export, and moderation tools</p>
          </div>
        )}

        {/* ========== REVENUE TAB ========== */}
        {activeTab === 'revenue' && (
          <div className="max-w-3xl">
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8">
              <div className="font-semibold text-2xl mb-6 tracking-tight">Revenue Overview — June 2025</div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="text-white/60 text-sm">Education Subscriptions (MRR)</div>
                  <div className="text-5xl font-semibold tracking-tighter mt-1">£{adminRevenue.mrr_education.toLocaleString()}</div>
                  <div className="text-emerald-400 text-sm mt-1">{adminRevenue.active_subscriptions} active subscribers</div>
                </div>
                <div>
                  <div className="text-white/60 text-sm">Total Revenue MTD</div>
                  <div className="text-5xl font-semibold tracking-tighter mt-1">£{adminRevenue.total_this_month.toLocaleString()}</div>
                  <div className="text-emerald-400 text-sm mt-1">+18% vs last month</div>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-3 border-t border-white/10">
                  <span>Yearly Premium Ad Placements</span>
                  <span className="font-mono">£{adminRevenue.one_time_ads.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 border-t border-white/10">
                  <span>Qualified Lead Fees</span>
                  <span className="font-mono">£{adminRevenue.lead_fees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-3 border-t border-white/10 font-medium">
                  <span>Total This Month</span>
                  <span className="font-mono">£{adminRevenue.total_this_month.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex gap-4">
                <button className="flex-1 py-3 rounded-2xl bg-[#D4AF37] text-[#0a0a0a] font-semibold">Download Monthly Report (CSV)</button>
                <button onClick={() => showToast('Opening Stripe Dashboard in new tab...')} className="flex-1 py-3 rounded-2xl border border-white/20 hover:bg-white/5">Open Stripe Dashboard →</button>
              </div>
            </div>
          </div>
        )}

        {/* ========== EDUCATE CONTENT TAB ========== */}
        {activeTab === 'educate' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="font-semibold text-xl">Flip Academy Content Management</div>
                <div className="text-white/60 text-sm">9 resources currently live • 2,847 active learners</div>
              </div>
              <button className="px-6 py-2.5 rounded-2xl bg-[#D4AF37] text-[#0a0a0a] font-semibold text-sm">+ Add New Resource</button>
            </div>

            <div className="bg-[#111] border border-white/10 rounded-3xl p-6 text-white/70">
              <p className="mb-4">This section would allow full CRUD of all Academy resources:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Add / edit video courses, PDFs, checklists, case studies</li>
                <li>Upload new files to Supabase Storage</li>
                <li>Mark resources as “Featured”, “New”, or “Premium only”</li>
                <li>Reorder the grid that flippers see in the EDUCATE tab</li>
                <li>View completion analytics per resource</li>
              </ul>
              <p className="mt-6 text-xs text-white/40">In the current prototype the EDUCATE content is statically seeded in the dashboard. This admin tab is ready for wiring to a real content management flow.</p>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-2xl shadow-2xl text-sm font-medium border ${
          toast.type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-red-600 border-red-500'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
