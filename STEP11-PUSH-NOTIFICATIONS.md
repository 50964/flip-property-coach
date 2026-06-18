# Step 11: Push Notifications for Alerts

This step adds **browser push notifications** to Flip Property Coach so flippers and suppliers get native OS-level alerts for critical events — even when they're on another tab.

## What Was Built

- `components/PushNotificationManager.tsx` — Handles permission request + Service Worker registration
- `public/sw.js` — Service Worker that displays notifications and handles click-to-navigate
- "Enable browser alerts" button in dashboard header (next to notification bell)
- When permission is granted, real-time Supabase events trigger native notifications:
  - **Suppliers**: New flipper enquiry received
  - **Flippers**: Supplier replied to your enquiry
- Existing in-app NotificationBell + Sonner toasts remain fully active

## How It Works

1. User clicks "🔔 Enable browser alerts" in the header
2. Browser shows permission prompt
3. On grant, Service Worker registers and listens for push events
4. When a new notification row is inserted in Supabase (via Realtime), the app triggers a native notification

## iOS Safari Notes

- Notifications work when the site is open in Safari
- For background push when the app is closed, users should **Add to Home Screen** (PWA) — see Step 12 / v1.4.0

## Testing

1. Open `/dashboard` or `/supplier-dashboard`
2. Click "Enable browser alerts" and grant permission
3. Use "Add Test Lead" (supplier) or contact a supplier (flipper) to trigger a notification
4. You should see a native OS notification pop up

## Files Changed

- `components/PushNotificationManager.tsx` (new)
- `public/sw.js` (new)
- `app/layout.tsx` — registers Service Worker on load
- `app/dashboard/page.tsx` — integrates PushNotificationManager
- `app/supplier-dashboard/page.tsx` — integrates PushNotificationManager

---

*Completed 18 June 2026 as part of v1.2.0 release*
