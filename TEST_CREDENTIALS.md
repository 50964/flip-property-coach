# Test Credentials for Flip Property Coach

## Overview
These credentials enable full end-to-end testing of the Flip Property Coach application including authentication, payments, and data persistence.

---

## Supabase Configuration (Testing)

**Project URL:** https://iflqppxwqvbqucmgfewx.supabase.co

### Test Accounts (Pre-created)

#### Flipper Account
- **Email:** flipper@test.com
- **Password/Magic Link:** Check your email (magic link will be sent)
- **Role:** Property Flipper
- **Test Data Included:** Sample projects, transactions, and team members

#### Supplier Account
- **Email:** supplier@test.com
- **Password/Magic Link:** Check your email (magic link will be sent)
- **Role:** Supplier/Tradesperson
- **Test Data Included:** Sample listings and leads

#### Admin Account
- **Email:** admin@test.com
- **Password/Magic Link:** Check your email (magic link will be sent)
- **Role:** Admin (for future admin dashboard)

### Supabase Database Schema
The following tables are pre-configured:

- `profiles` — User profiles and metadata
- `projects` — Property flipping projects
- `transactions` — Financial transactions and cashflow
- `team_members` — Team and suppliers
- `suppliers` — Supplier listings and information
- `leads` — Leads for suppliers
- `subscriptions` — Active subscriptions

**Note:** All data is in test mode and will reset weekly.

---

## Stripe Configuration (Test Mode)

**Account:** Flip Property Coach Test Account
**Mode:** Test (no real charges)

### Test Credit Cards

Use these cards for testing different payment scenarios:

**Successful Payment:**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

**Declined Payment:**
- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Requires Authentication (3D Secure):**
- Card Number: `4000 0025 0000 3155`
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

### Stripe Products (Pre-configured)

1. **Flip Academy Monthly Subscription**
   - Price: £29.00/month
   - Price ID: `price_1PvFZ4P1X5X5X5X5X5X5X5X5`
   - Type: Recurring subscription

2. **Premium Supplier Listing (12 months)**
   - Price: £1,200.00 (one-time)
   - Price ID: `price_1PvFZ4P1X5X5X5X5X5X5X5X5`
   - Type: One-time payment

3. **Qualified Lead**
   - Price: £45.00 (one-time)
   - Price ID: `price_1PvFZ4P1X5X5X5X5X5X5X5X5`
   - Type: One-time payment

---

## Testing Instructions

### Setup
1. Update your `.env.local` file with credentials from `.env.local` in this repository
2. Run `npm install && npm run dev`
3. Open http://localhost:3000

### Login Testing
1. Click "Try the live demo" or navigate to `/login`
2. Enter `flipper@test.com` and click "Send Magic Link"
3. Check your email for the magic link
4. Click the link to automatically log in
5. You'll be redirected to the dashboard

### Payment Testing
1. Log in as `flipper@test.com`
2. Navigate to EDUCATE → Click "Subscribe to Flip Academy"
3. You'll be taken to Stripe Checkout
4. Use card `4242 4242 4242 4242` (successful payment)
5. Complete the checkout and confirm success

### Supplier Testing
1. Go to landing page → Click "Become a Supplier"
2. Enter `supplier@test.com`
3. Complete supplier signup
4. Access supplier dashboard to manage listings

---

## Demo Mode (No Login Required)

The application also includes a full **Demo Mode** that works completely offline:

1. Click "Try the live demo" on the landing page
2. Select "Continue in Demo Mode"
3. All features work with simulated data stored in browser localStorage
4. No real accounts or payments needed

Demo Mode is perfect for:
- UI/UX testing
- Feature workflows
- Performance testing
- Offline functionality

---

## Test Scenarios

### Flipper Journey
- [ ] Sign up with email
- [ ] Complete profile setup
- [ ] Create a new project
- [ ] Add transactions
- [ ] View cashflow charts
- [ ] Export CSV
- [ ] Search and add suppliers to team
- [ ] Subscribe to Flip Academy
- [ ] View educational courses

### Supplier Journey
- [ ] Apply as supplier
- [ ] Complete profile setup
- [ ] Create service listings
- [ ] View incoming leads
- [ ] Purchase premium ad listing
- [ ] Manage ad visibility
- [ ] Track performance

### Payment Testing
- [ ] Education subscription (£29/month)
- [ ] Supplier ad purchase (£1,200)
- [ ] Lead purchase (£45)
- [ ] Failed payment handling
- [ ] Payment receipt/confirmation

---

## Important Notes

- **Test Data Resets:** Supabase test data resets weekly. For persistent testing data, contact the administrator.
- **Email Verification:** Magic links are sent to the email address provided during signup. Check spam folders if email doesn't arrive within 2 minutes.
- **Stripe Webhooks:** In development, webhooks are simulated. In production, Stripe will send real webhook events.
- **Browser Storage:** Demo Mode uses browser localStorage. Clear browser data between tests if needed (Settings → Clear Browsing Data).

---

## Troubleshooting

### Magic Link Not Received
1. Check spam/junk folder
2. Verify email address is correct
3. Wait up to 2 minutes for email delivery
4. Try a different email address

### Stripe Checkout Not Loading
1. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`
2. Check browser console for errors (F12)
3. Ensure you're logged in with a real account (not Demo Mode)
4. Try a different browser

### Dashboard Not Loading
1. Verify Supabase credentials in `.env.local`
2. Check if you're logged in
3. Clear browser cache (Cmd+Shift+Delete on Mac)
4. Restart dev server (`npm run dev`)

---

## Support

For issues or questions during testing, contact the development team with:
- Browser and OS version
- Steps to reproduce the issue
- Screenshot or error message from console (F12)

