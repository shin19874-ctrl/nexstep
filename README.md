# NEXSTEP (Supabase)

## 1. Database (Supabase > SQL Editor)
Run `supabase/schema.sql` first (skip if you already ran it), then `supabase/upgrade.sql`. Both are safe to re-run.
First admin: sign up on the site, then run:
`update public.profiles set role = 'admin' where email = 'YOUR_EMAIL_HERE';`

## 2. Supabase settings
Authentication > URL Configuration:
- Site URL: your live address, e.g. `https://YOURNAME.github.io/YOUR-REPO/`
- Redirect URLs (add all): `https://YOURNAME.github.io/YOUR-REPO/`, `https://YOURNAME.github.io/YOUR-REPO/**`, `http://localhost:5173/`, `http://localhost:5173/**`
Authentication > Providers > Email: enabled, "Confirm email" on.

## 3. Google sign-in
Google Cloud Console (console.cloud.google.com) > APIs & Services:
1. OAuth consent screen: External, add app name and your email, publish.
2. Credentials > Create credentials > OAuth client ID > Web application.
   - Authorized JavaScript origins: `https://YOURNAME.github.io` and `http://localhost:5173`
   - Authorized redirect URIs: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback` (copy the exact URL shown in Supabase > Authentication > Providers > Google)
3. Copy the Client ID and Client secret into Supabase > Authentication > Providers > Google, switch it on, Save.

## 4. Approval emails (Edge Function + Resend)
1. Create a free account at resend.com, verify your sending domain (needed to email students; without a domain Resend only emails yourself) and create an API key.
2. Supabase > Edge Functions > Deploy a new function > name it exactly `send-approval-email`, paste `supabase/functions/send-approval-email/index.ts`, Deploy.
3. Edge Functions > Secrets: add `RESEND_API_KEY` and `EMAIL_FROM` (e.g. `NEXSTEP <hello@yourdomain.com>`). Keep "Verify JWT" on.
The key lives only on Supabase, never in the website.

## 5. Run and deploy
Local: `npm install`, copy `.env.example` to `.env` (URL and anon key), `npm run dev`.
GitHub: add repo secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, set Settings > Pages > Source to "GitHub Actions", push to `main`.
