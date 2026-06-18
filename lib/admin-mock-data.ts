// Flip Property Coach - Admin Panel Mock Data
// This powers the beautiful interactive admin demo.
// In production this would come from Supabase with proper RLS for admins only.

export interface AdminMetric {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface AdminSupplier {
  id: string;
  company_name: string;
  category: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  is_featured: boolean;
  rating: number;
  total_leads: number;
  joined: string;
  email: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'flipper' | 'supplier';
  status: 'active' | 'suspended';
  joined: string;
  projects: number;
  last_active: string;
}

export interface AdminLead {
  id: string;
  date: string;
  flipper_name: string;
  supplier_name: string;
  project: string;
  status: 'new' | 'contacted' | 'quoted' | 'closed';
  message_preview: string;
}

export interface AdminRevenue {
  mrr_education: number;
  one_time_ads: number;
  lead_fees: number;
  total_this_month: number;
  active_subscriptions: number;
  pending_renewals: number;
}

// === LIVE METRICS (Overview) ===
export const adminMetrics: AdminMetric[] = [
  { label: "Total Flippers", value: 1247, change: "+89 this month", trend: "up" },
  { label: "Active Suppliers", value: 186, change: "+12 this month", trend: "up" },
  { label: "Active Projects", value: 312, change: "+47 this week", trend: "up" },
  { label: "Revenue (MTD)", value: "£48,920", change: "+£7,400 vs last month", trend: "up" },
  { label: "New Enquiries Today", value: 34, change: "-8 vs yesterday", trend: "down" },
  { label: "Pending Approvals", value: 7, change: "3 urgent", trend: "neutral" },
];

// === SUPPLIERS ===
export let adminSuppliers: AdminSupplier[] = [
  {
    id: "sup_001",
    company_name: "NorthWest Renovations Ltd",
    category: "Builder / Renovator",
    location: "Manchester & North West",
    status: "approved",
    is_featured: true,
    rating: 4.8,
    total_leads: 47,
    joined: "2025-01-12",
    email: "hello@nwrenovations.co.uk",
  },
  {
    id: "sup_002",
    company_name: "SparkRight Electrical",
    category: "Electrician",
    location: "London & South East",
    status: "approved",
    is_featured: false,
    rating: 4.6,
    total_leads: 29,
    joined: "2025-02-03",
    email: "jobs@sparkright.co.uk",
  },
  {
    id: "sup_003",
    company_name: "AquaFlow Plumbing & Heating",
    category: "Plumber",
    location: "Birmingham & Midlands",
    status: "pending",
    is_featured: false,
    rating: 0,
    total_leads: 0,
    joined: "2025-06-15",
    email: "info@aquaflowplumbing.com",
  },
  {
    id: "sup_004",
    company_name: "Elite Kitchen Installations",
    category: "Kitchen Fitter",
    location: "Nationwide",
    status: "approved",
    is_featured: true,
    rating: 4.9,
    total_leads: 63,
    joined: "2024-11-20",
    email: "sales@elitekitchens.co.uk",
  },
  {
    id: "sup_005",
    company_name: "Precision Tiling & Flooring",
    category: "Tiler / Flooring",
    location: "Yorkshire",
    status: "pending",
    is_featured: false,
    rating: 0,
    total_leads: 0,
    joined: "2025-06-17",
    email: "quotes@precisiontiling.co.uk",
  },
];

// === USERS ===
export let adminUsers: AdminUser[] = [
  { id: "usr_101", name: "Alex Thompson", email: "alex@flipdemo.co.uk", role: "flipper", status: "active", joined: "2025-03-14", projects: 4, last_active: "2 hours ago" },
  { id: "usr_102", name: "Sarah Patel", email: "sarah.patel@pmail.com", role: "flipper", status: "active", joined: "2025-04-22", projects: 2, last_active: "Yesterday" },
  { id: "usr_103", name: "Marcus Webb", email: "marcus@webbproperty.co.uk", role: "flipper", status: "suspended", joined: "2025-01-08", projects: 7, last_active: "3 weeks ago" },
  { id: "usr_201", name: "NorthWest Renovations Ltd", email: "hello@nwrenovations.co.uk", role: "supplier", status: "active", joined: "2025-01-12", projects: 0, last_active: "Today" },
  { id: "usr_202", name: "SparkRight Electrical", email: "jobs@sparkright.co.uk", role: "supplier", status: "active", joined: "2025-02-03", projects: 0, last_active: "4 hours ago" },
];

// === LEADS (recent platform activity) ===
export const adminLeads: AdminLead[] = [
  { id: "lead_901", date: "2025-06-18", flipper_name: "Alex Thompson", supplier_name: "NorthWest Renovations Ltd", project: "3-bed terrace flip - Manchester", status: "new", message_preview: "Hi, interested in your full renovation package for our current flip..." },
  { id: "lead_902", date: "2025-06-17", flipper_name: "James Okoro", supplier_name: "Elite Kitchen Installations", project: "Kitchen + utility room - Leeds", status: "quoted", message_preview: "Looking for a quote on high-end shaker kitchen..." },
  { id: "lead_903", date: "2025-06-17", flipper_name: "Priya Sharma", supplier_name: "SparkRight Electrical", project: "Full rewire - Bristol HMO", status: "contacted", message_preview: "Need urgent quote for consumer unit upgrade..." },
];

// === REVENUE ===
export const adminRevenue: AdminRevenue = {
  mrr_education: 28900,
  one_time_ads: 14400,
  lead_fees: 6120,
  total_this_month: 49420,
  active_subscriptions: 996,
  pending_renewals: 14,
};

// Helper to update supplier status (demo only)
export function updateSupplierStatus(id: string, newStatus: AdminSupplier['status']) {
  adminSuppliers = adminSuppliers.map(s =>
    s.id === id ? { ...s, status: newStatus } : s
  );
  return adminSuppliers;
}

export function toggleFeatured(id: string) {
  adminSuppliers = adminSuppliers.map(s =>
    s.id === id ? { ...s, is_featured: !s.is_featured } : s
  );
  return adminSuppliers;
}

export function updateUserStatus(id: string, newStatus: AdminUser['status']) {
  adminUsers = adminUsers.map(u =>
    u.id === id ? { ...u, status: newStatus } : u
  );
  return adminUsers;
}
