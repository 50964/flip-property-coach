# Step 5: Authentication & User Accounts – COMPLETED ✅

## What was delivered
- Full magic link authentication (passwordless) powered by Supabase
- Protected `/dashboard` routes via middleware
- Beautiful dedicated `/login` page with magic link flow + instant Demo Mode option
- Dashboard now intelligently prefers real logged-in users (pulls profile from Supabase)
- Falls back gracefully to the existing rich Demo Mode (localStorage) when no real session
- "DEMO" badge clearly visible in header when using demo
- Proper sign-out that clears both Supabase session and local demo data
- Real-time auth state listener (magic link auto-logs you in when you click the email link)
- Auto profile creation via existing database trigger

## How to activate real authentication (5–7 minutes)

### 1. Supabase Dashboard Setup (one-time)
1. Go to your Supabase project → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000`
3. (Later for production) Add your real domain (e.g. `https://flippropertycoach.com`)
4. Go to **Authentication** → **Providers** → **Email**
   - Make sure it is **Enabled**
   - Magic links are enabled by default (no extra config needed)
5. (Optional but recommended) Customize the email template:
   - Go to **Authentication** → **Email Templates** → **Magic Link**
   - Update subject and body to mention "Flip Property Coach"

### 2. Environment Variables
Make sure you have a `.env.local` file in the project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

(You can copy from `.env.example`)

### 3. Run the schema (if not already done in Step 4)
```bash
# In Supabase SQL Editor, run the entire contents of:
supabase/schema.sql
```

The `handle_new_user()` trigger is already included — it automatically creates a `profiles` row when a new user signs up via magic link.

### 4. Test it
```bash
npm run dev
```

1. Go to http://localhost:3000/login
2. Enter any email (even a real one you control)
3. Click **Send Magic Link**
4. Check your inbox → click the link
5. You should be instantly logged into the dashboard as a real user (your name comes from the email or you can update profile later)
6. The **DEMO** badge should disappear
7. Sign out → you are taken back to /login

Demo Mode still works perfectly via the big button on the login page (instant, no email).

## Current behaviour summary
| Situation                    | What happens in Dashboard                  | Badge     |
|-----------------------------|--------------------------------------------|-----------|
| Real Supabase user logged in | Uses your real profile + future real data  | (none)    |
| No real session             | Auto-logs as "Alex Thompson" demo          | DEMO      |
| After magic link click      | Auto-detects session → switches to real    | (none)    |
| Sign out                    | Clears everything → back to /login         | —         |

## Next steps (recommended order)
- Step 6: Real Stripe integration (replace the simulated payment modals)
- Migrate key data saving (projects, transactions, team) from localStorage to Supabase (so real users get persistence)
- Supplier-side experience
- Polish education content, file uploads, etc.

You now have production-ready authentication. The product already feels complete and professional.

---

**Status in roadmap:** Step 5 ✅ Complete
