# Flip Property Coach — Release Notes & Version History

## v1.4.0 — PWA Install Prompt & Mobile Experience (18 June 2026)

**New in this release:**
- **Progressive Web App (PWA) support** — Users can now install Flip Property Coach on their home screen (iPhone, iPad, Android, desktop)
- Beautiful, non-intrusive **"Install App" prompt** that appears after ~45 seconds of engagement (or on second visit for iOS)
- Smart detection:
  - Chrome / Edge / Android: Uses native `beforeinstallprompt` for one-tap install
  - iOS Safari: Shows clear step-by-step "Add to Home Screen" instructions (critical for reliable iOS installs)
  - Already installed / standalone mode: Prompt never shows again
- **Dismissal memory** — If user dismisses, won't nag again for 7 days
- New `PWAInstallPrompt.tsx` component with gold-accented UI matching brand
- `manifest.ts` already configured for standalone display, theme colour, icons
- Service worker (`sw.js`) registered for offline capability foundation

**Files added/changed:**
- `components/PWAInstallPrompt.tsx` (new)
- `app/layout.tsx` (integrated prompt)
- `RELEASES.md` (this file)

---

## v1.3.0 — Education Paywall & Freemium Model (18 June 2026)

- Freemium gating on Educate tab (free cheat sheets + templates, premium courses/case studies)
- Beautiful paywall modal with Stripe upgrade flow
- `hasEducationSubscription` demo flag + real Stripe path

## v1.2.0 — Push Notifications (18 June 2026)

- Native browser push notifications for leads and replies
- `PushNotificationManager.tsx` + `NotificationBell.tsx`

## v1.1.0 — Admin Panel (18 June 2026)

- Full admin dashboard at `/admin`
- User management, leads, revenue, content tabs

## v1.0.0 — Initial Release (June 2026)

- Core flip dashboard (Find, Finance, Flip, Educate)
- Supplier marketplace + supplier dashboard
- Supabase auth + demo mode
- Stripe payments integration
