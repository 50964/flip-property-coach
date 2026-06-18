-- ============================================
-- Flip Property Coach – Complete Supabase Schema
-- Production-ready for Step 4
-- ============================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================
-- PROFILES (linked to Supabase Auth)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text unique,
  role text check (role in ('flipper', 'supplier', 'admin')) default 'flipper',
  company_name text,
  phone text,
  location text,
  avatar_url text,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on new user signup (trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'flipper')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- SUPPLIERS (Marketplace listings)
-- ============================================
create table public.suppliers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null,           -- Builder, Electrician, Plumber, Roofer, etc.
  description text,
  location text,
  price_range text,                 -- e.g. "£150-300/day" or "£5k-£15k per project"
  rating numeric(2,1) default 4.5,
  review_count integer default 0,
  verified boolean default false,
  contact_email text,
  contact_phone text,
  website text,
  created_by uuid references public.profiles,  -- if supplier created their own listing
  created_at timestamptz default now()
);

-- ============================================
-- LEADS (Supplier inbox — enquiries from flippers)
-- ============================================
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  supplier_id uuid references public.suppliers on delete cascade not null,
  flipper_user_id uuid references public.profiles,
  flipper_name text not null,
  project text,
  message text not null,
  status text default 'new' check (status in ('new', 'contacted', 'quoted', 'closed')),
  reply_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- PROJECTS (User's property flips)
-- ============================================
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles not null,
  name text not null,                    -- e.g. "12 Oak Street Flip"
  property_address text,
  status text default 'planning' check (status in ('planning', 'in_progress', 'completed', 'on_hold')),
  budget numeric(12,2) default 0,
  spent numeric(12,2) default 0,
  start_date date,
  target_end_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- TRANSACTIONS (Cashflow per project)
-- ============================================
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  user_id uuid references public.profiles not null,
  date date default current_date,
  description text not null,
  category text default 'Other',
  amount numeric(12,2) not null,
  type text check (type in ('income', 'expense')) not null,
  receipt_url text,                      -- Supabase Storage path later
  created_at timestamptz default now()
);

-- ============================================
-- TEAM MEMBERS (Saved suppliers per flipper)
-- ============================================
create table public.team_members (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles not null,
  supplier_id uuid references public.suppliers not null,
  notes text,                            -- "Great plasterer, fast & tidy"
  added_at timestamptz default now(),
  unique(user_id, supplier_id)
);

-- ============================================
-- SAVED PROPERTIES (Watchlist / FIND section)
-- ============================================
create table public.saved_properties (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles not null,
  address text not null,
  price numeric(12,2),
  bedrooms integer,
  bathrooms integer,
  description text,
  source_url text,                       -- Rightmove / Zoopla link
  status text default 'watching' check (status in ('watching', 'under_offer', 'purchased', 'passed')),
  saved_at timestamptz default now()
);

-- ============================================
-- TODOS (Per project task lists)
-- ============================================
create table public.todos (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects on delete cascade not null,
  user_id uuid references public.profiles not null,
  text text not null,
  completed boolean default false,
  due_date date,
  created_at timestamptz default now()
);

-- ============================================
-- SUBSCRIPTIONS (Education hub monthly subs)
-- ============================================
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles not null,
  status text default 'inactive' check (status in ('active', 'inactive', 'past_due', 'canceled')),
  plan text default 'monthly' check (plan in ('monthly', 'annual')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- AD PURCHASES (Supplier advertising)
-- ============================================
create table public.ad_purchases (
  id uuid default gen_random_uuid() primary key,
  supplier_id uuid references public.suppliers not null,
  type text check (type in ('yearly_unlimited', 'per_lead')) not null,
  amount numeric(10,2) not null,
  status text default 'active' check (status in ('active', 'expired', 'pending')),
  starts_at timestamptz default now(),
  ends_at timestamptz,
  stripe_payment_intent_id text,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) – Critical for security
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.suppliers enable row level security;
alter table public.projects enable row level security;
alter table public.transactions enable row level security;
alter table public.team_members enable row level security;
alter table public.saved_properties enable row level security;
alter table public.todos enable row level security;
alter table public.subscriptions enable row level security;
alter table public.ad_purchases enable row level security;

-- PROFILES policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- SUPPLIERS policies (public read for marketplace, suppliers can manage own)
create policy "Anyone can view suppliers"
  on public.suppliers for select
  using (true);

create policy "Suppliers can insert their own listings"
  on public.suppliers for insert
  with check (auth.uid() = created_by);

create policy "Suppliers can update own listings"
  on public.suppliers for update
  using (auth.uid() = created_by);

-- PROJECTS policies
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- TRANSACTIONS policies
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can manage own transactions"
  on public.transactions for all
  using (auth.uid() = user_id);

-- TEAM MEMBERS policies
create policy "Users can view own team"
  on public.team_members for select
  using (auth.uid() = user_id);

create policy "Users can manage own team"
  on public.team_members for all
  using (auth.uid() = user_id);

-- SAVED PROPERTIES policies
create policy "Users can manage own saved properties"
  on public.saved_properties for all
  using (auth.uid() = user_id);

-- TODOS policies
create policy "Users can manage own todos"
  on public.todos for all
  using (auth.uid() = user_id);

-- SUBSCRIPTIONS policies
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can manage own subscriptions"
  on public.subscriptions for all
  using (auth.uid() = user_id);

-- AD PURCHASES policies (suppliers manage their own ads)
create policy "Suppliers can view own ad purchases"
  on public.ad_purchases for select
  using (exists (
    select 1 from public.suppliers 
    where suppliers.id = ad_purchases.supplier_id 
    and suppliers.created_by = auth.uid()
  ));

create policy "Suppliers can insert own ad purchases"
  on public.ad_purchases for insert
  with check (exists (
    select 1 from public.suppliers 
    where suppliers.id = ad_purchases.supplier_id 
    and suppliers.created_by = auth.uid()
  ));

-- LEADS policies (suppliers manage leads for their listings)
create policy "Suppliers can view leads for their listings"
  on public.leads for select
  using (exists (
    select 1 from public.suppliers 
    where suppliers.id = leads.supplier_id 
    and suppliers.created_by = auth.uid()
  ));

create policy "Suppliers can update leads for their listings"
  on public.leads for update
  using (exists (
    select 1 from public.suppliers 
    where suppliers.id = leads.supplier_id 
    and suppliers.created_by = auth.uid()
  ));

create policy "Flipper can insert leads when contacting suppliers"
  on public.leads for insert
  with check (true);  -- Anyone logged in can create a lead (we can tighten later)

create policy "Flippers can view their own leads (enquiries & replies)"
  on public.leads for select
  using (auth.uid() = flipper_user_id);

create policy "Flippers can update their own leads (status, follow-ups)"
  on public.leads for update
  using (auth.uid() = flipper_user_id)
  with check (auth.uid() = flipper_user_id);

-- ============================================
-- INDEXES for performance
-- ============================================
create index idx_projects_user_id on public.projects(user_id);
create index idx_leads_flipper_user_id on public.leads(flipper_user_id);
create index idx_transactions_project_id on public.transactions(project_id);
create index idx_team_members_user_id on public.team_members(user_id);
create index idx_suppliers_category on public.suppliers(category);
create index idx_suppliers_location on public.suppliers(location);
create index idx_leads_supplier_id on public.leads(supplier_id);

-- ============================================
-- SAMPLE DATA SEED (for demo / testing)
-- ============================================

-- Note: Run this AFTER you have at least one user in auth.users
-- For demo purposes, we'll insert suppliers that anyone can see

insert into public.suppliers (name, category, description, location, price_range, rating, review_count, verified) values
('ProBuild Contractors Ltd', 'Builder', 'Full-service property renovation specialists. Extensions, conversions, full flips.', 'Manchester', '£180-280/day or fixed project quotes', 4.8, 127, true),
('SparkRight Electrical', 'Electrician', 'Domestic & commercial rewires, consumer units, EV chargers, smart home.', 'Greater Manchester', '£45-65/hr', 4.9, 89, true),
('AquaFlow Plumbing & Heating', 'Plumber', 'Boiler installs, full re-pipes, bathroom suites, leak detection.', 'Stockport & South Manchester', '£50-70/hr or day rate', 4.6, 64, true),
('Peak Roofing Solutions', 'Roofer', 'Slating, tiling, flat roofs, leadwork, guttering. 10-year guarantees.', 'Derbyshire & Greater Manchester', 'From £2,800 for typical semi roof', 4.7, 52, true),
('Precision Plastering', 'Plasterer', 'Skim, boarding, external rendering, damp proofing.', 'North West', '£35-50/hr or per m²', 4.5, 38, false),
('Forge & Flame Kitchens', 'Kitchen Fitter', 'Bespoke & off-the-shelf kitchen design + installation. Worktops, appliances.', 'Cheshire & Manchester', '£4,500 - £18,000 typical', 4.8, 71, true),
('Elite Decorating Pros', 'Decorator', 'Full interior/exterior painting, wallpapering, feature walls.', 'Manchester & Cheshire', '£28-40/hr', 4.4, 29, true);

-- Sample demo project (will be linked when user signs up)
-- You can run additional inserts manually after creating a user.

comment on table public.profiles is 'User profiles linked to Supabase Auth. Role determines flipper vs supplier experience.';
comment on table public.suppliers is 'Global marketplace of service providers. Visible to all flippers.';
comment on table public.projects is 'Each flipper''s active or historical property projects.';
comment on table public.transactions is 'Every pound in or out — the source of truth for cashflow & accountant exports.';

-- End of schema
-- ============================================
