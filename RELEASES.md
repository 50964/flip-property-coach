# Flip Property Coach — Release Notes & Version History

## v1.4.0 — PWA Install Prompt & Mobile Experience (18 June 2026)

**New in this release:**
- **Progressive Web App (PWA) support** — Users can now install Flip Property Coach on their home screen (iPhone, iPad, Android, desktop)
- Beautiful, non-intrusive **"Install App" prompt** that appears after ~45 seconds of engagement (or on second visit for iOS)
- Smart detection:
  - Chrome / Edge / Android: Uses native `beforeinstallprompt` for one-tap install
  - iOS Safari: Shows clear step-by-step "Add to Home Screen" instructions (critical for reliable push notifications on iPhone)
- Added proper `manifest.ts` with app name, icons, theme color, and standalone display mode
- Service Worker registration now happens on every page load (foundation for offline support + background push in future)
- Updated icons and metadata for proper PWA branding (uses your premium gold coin logo)
- Prompt is fully dismissible ("Maybe later") and remembers user preference

**Why this matters:**
- On iPhone: Adding to Home Screen dramatically improves push notification reliability and gives a native app-like experience
- Users get faster access and feel like they have a real dedicated tool for their flipping business
- Sets the stage for true offline capability and background notifications in future releases

This release makes the product feel like a proper installed app on mobile — exactly what busy flippers and suppliers need.

---

## v1.3.0 — Education Paywall + Freemium Model (18 June 2026)

**New in this release:**
- **Education area now properly gated** behind £29/mo Flip Academy Pro subscription
- **Freemium model implemented** — 3 high-value resources are **free forever** (UK Tax Cheat Sheet, Contractor Negotiation Templates, HMO Licensing Checklist)
- 6 premium resources (full video courses, advanced case studies, masterclasses) are locked behind subscription
- Beautiful paywall modal when a non-subscriber tries to open a premium resource
- Clear "PREMIUM" badge on locked cards in the grid
- Subscription status badge shown in EDUCATE header ("Flip Academy Pro" when active)
- After successful demo payment, user is instantly granted full access (real Stripe webhook will do the same for production users)
- "Maybe later" + strong value proposition in paywall
- Updated quick stats bar to clearly communicate "3 Free + 6 Premium"

**User experience:**
- Free users get immediate value from 3 excellent free resources
- Premium users get the complete library + new content added monthly
- Clean, non-intrusive gating that still feels generous

This completes the monetization loop for the education pillar while remaining user-friendly.

---

## v1.2.0 — Push Notifications for Alerts (18 June 2026)

**New in this release:**
- **Browser Push Notifications** — Users can now enable native browser alerts for critical events (new leads for suppliers, supplier replies for flippers)
- Beautiful "Enable browser alerts" button appears in the header next to the notification bell (only shown until permission is granted)
- When enabled, real-time events from Supabase now trigger **native OS-level notifications** (with icon, title, body, and click-to-navigate)
- Service Worker (`/sw.js`) registered on all dashboards — foundation for future true background Web Push (even when tab is closed) and PWA install on iPhone/Android
- Existing in-app NotificationBell + Sonner toasts remain fully active (push is an enhancement layer)
- Works great on desktop and when the site is open on iPhone

**How it works for users:**
1. Click the small "🔔 Enable browser alerts" button in the header
2. Grant permission in the browser prompt
3. Receive native pop-up notifications instantly when new leads arrive or suppliers reply — even if you're on another tab

**Technical notes:**
- Uses the standard Web Notifications API + Service Worker
- On iOS Safari: Notifications work when the site is open; full background push requires adding to Home Screen as PWA (future enhancement)
- Fully backward compatible — users who don't enable it see zero change

This release significantly increases engagement and responsiveness for busy flippers and suppliers.

---

**Repository:** flip-property-coach-next  
**Product:** Flip Property Coach — Two-sided marketplace for property flippers and suppliers  
**Theme:** Premium dark mode with gold accents. "Flip" concept (coin flip between suppliers & flippers)

---

## v1.1.0 — Premium Branding & Visual Identity (18 June 2026)

**New in this release:**
- Professional custom logo (horizontal primary version) integrated across **all pages**: Landing, Dashboard, Supplier Hub, Admin Panel, and Login
- Cinematic hero image featuring the signature gold coin + UK renovation property with subtle quadrant UI overlay — now prominently displayed on the landing page in a beautiful split layout
- Consistent premium dark/gold visual language strengthened across the entire product
- Logo is now the single source of truth for brand identity (replaces all previous simple "F" icons)

**Files added:**
- `/public/logo.png` — Primary horizontal logo (icon + wordmark)
- `/public/hero.jpg` — Hero visual for landing page

This release makes the product feel complete and ready for real supplier/flipper onboarding and investor demos.

---

## v1.0.0 — Complete MVP Launch (18 June 2026)

**This is the foundational release.** It contains the full core product built collaboratively through our step-by-step development process (Steps 0–10).

All future changes, features, and fixes will be tracked from this baseline using semantic versioning and detailed release notes. 

**Rollback to this exact v1.0.0 state:**  
Simply unzip the release archive `flip-property-coach-v1.0.0-release.zip` (located in the parent `artifacts/` folder) — it contains the complete pristine codebase at this milestone. You can also copy the entire `flip-property-coach-next/` folder as a manual snapshot.

### What's Included in v1.0.0

**Authentication & Access**
- Magic-link passwordless login (Supabase)
- Protected routes (`/dashboard`, `/supplier-dashboard`, `/admin`)
- Rich **Demo Mode** fallback (instant access with realistic mock data — perfect for demos and investor pitches)
- Seamless switch between real logged-in users and demo mode

**Flipper Dashboard (Main App)**
- Exact four-quadrant navigation you requested: **FIND • FINANCE • FLIP • EDUCATE** (massive, easy-to-tap buttons)
- **My Enquiries** tab — full history of every supplier contact you've made + supplier replies
- **Full Contact Supplier flow** from FIND tab (professional modal → creates real lead → triggers instant real-time notification to supplier)
- Real-time notification bell + toasts (powered by Supabase Realtime)
- Multiple projects with easy switcher + one-click create new project
- Per-project: To-do lists, budget tracking, status, milestones
- Cashflow workbook: Live editable transactions, Recharts graphs, one-click CSV export for your accountant, professional PDF report export
- Receipt file uploads (Supabase Storage ready)
- Team Builder: Add favourite suppliers to your personal flip team
- Saved properties: Search the market and save interesting deals

**Supplier Dashboard** (`/supplier-dashboard`)
- Editable marketplace listing (8 categories, rich description, coverage, pricing, contact)
- Premium Ad performance dashboard (impressions, CTR, leads, revenue)
- Leads Inbox with status workflow (NEW → CONTACTED → QUOTED → CLOSED) + reply system
- Real-time notifications when new flipper enquiries arrive
- "Add Test Lead" for instant demoing

**Flip Academy (EDUCATE section)**
- 9 premium, UK-specific seeded resources:
  1. The Complete Flipper's Playbook (6-module video course)
  2. UK Tax & Accounting for Flippers 2025 (Cheat Sheet)
  3. Bathroom Renovation ROI Case Study – Manchester
  4. Contractor Negotiation Scripts & Templates
  5. Finding Off-Market Deals Masterclass (webinar)
  6. HMO Licensing & Compliance Checklist (interactive)
  7. Whiteboard: Full Kitchen Flip Walkthrough
  8. Stamp Duty & SDLT Optimisation Guide
  9. Kitchen Value-Add Case Study – £41k Profit
- Category filtering, powerful search, beautiful detail modals
- Interactive checklists with auto-progress
- One-click branded PDF generation
- "Mark as Complete" with live progress tracking in header

**Admin Command Centre** (`/admin`)
- Overview dashboard with live KPIs, revenue breakdown, recent activity
- Supplier management: Pending approvals queue, approve/reject, feature/unfeature, suspend
- User management: Searchable table, role/status, suspend/reactivate
- Leads oversight across the platform
- Revenue overview (Education MRR + Ad sales + Lead fees) + CSV export buttons
- Educate content management placeholder (ready for full CRUD)

**Monetization (Stripe-ready)**
- Education subscription: £29/month recurring
- Supplier advertising: £1,200/year premium placement **or** £45 per qualified lead
- Full Stripe Checkout flow (real in production, beautiful simulation in demo mode)
- Webhook handling infrastructure in place

**Technical Stack & Quality**
- Next.js 14 + TypeScript + Tailwind CSS
- Supabase (PostgreSQL + Auth + Storage + Realtime + Row Level Security)
- Stripe (Checkout + Webhooks)
- Professional, consistent dark theme with gold accents throughout
- Fully responsive, mobile-first design with large tappable buttons
- Clean, typed data layer (`lib/supabase-data.ts`)
- Complete Supabase schema (10+ tables) with proper RLS policies
- All setup guides (STEP4 through STEP10) included in the folder

**Data Persistence**
- Real Supabase persistence for logged-in users (projects, transactions, team, leads, listings, etc.)
- Demo Mode uses sophisticated local state so everything feels real instantly

### How to Get Started
```bash
npm install
npm run dev
```
Then visit http://localhost:3000 and use any of the demo buttons on the login page.

See `README.md` and the individual `STEPx-*.md` guides for detailed setup (Supabase, Stripe, etc.).

### Upgrade Path from Previous Prototypes
This release supersedes:
- The original HTML interactive prototype
- All incremental step builds (Steps 3–10)

Everything is now consolidated into one clean, production-grade Next.js codebase.

### Rollback Instructions
To return to this exact release at any point in the future:
```bash
git checkout v1.0.0
# or
git reset --hard v1.0.0
```

---

## Versioning Policy (from v1.0.0 onwards)

- **Major (x.0.0)**: Significant new product areas or breaking changes
- **Minor (x.y.0)**: New features, major UX improvements, new sections
- **Patch (x.y.z)**: Bug fixes, small polish, content updates

All releases will include:
- Clear "What's new" summary
- Migration / breaking change notes (if any)
- Updated `RELEASES.md`

---

**This v1.0.0 release represents a complete, monetizable, two-sided SaaS MVP** that already feels like a professional product flippers and suppliers would use and pay for daily.

Future development will build on this solid foundation with full git history for complete traceability and the ability to undo any changes.

---

*Generated as part of the collaborative build process on 18 June 2026*