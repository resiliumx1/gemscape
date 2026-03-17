

## Plan: Complete Backend Setup (Skip Resend for Now)

The database tables, RLS policies, and booking ref functions are all in place. What remains:

### 1. Add Missing Database Triggers

The trigger functions `set_booking_ref` and `set_rental_booking_ref` exist but no triggers are attached. Run a migration to create:
- `trg_booking_ref` BEFORE INSERT on `bookings` calling `set_booking_ref()`
- `trg_rental_booking_ref` BEFORE INSERT on `rental_bookings` calling `set_rental_booking_ref()`

### 2. Create `send-booking-email` Edge Function (Stub)

Create `supabase/functions/send-booking-email/index.ts` that:
- Accepts `{ booking, emailType }` via POST
- Checks for `RESEND_API_KEY` env var — if missing, logs a warning and returns success (no-op)
- When key is present, sends via Resend API with 3 templates: `customer_confirmation`, `owner_notification`, `review_request`
- Returns the send result

This lets the rest of the system work now; emails activate once you add the API key later.

### 3. Create `process-review-queue` Edge Function

Create `supabase/functions/process-review-queue/index.ts` that:
- Uses the service role key to query `review_queue` where `scheduled_send <= now()` and `sent_at IS NULL`
- Calls the send-booking-email function for each pending review
- Updates `sent_at` on processed rows

### 4. Set Up pg_cron Job

Enable `pg_cron` and `pg_net` extensions, then schedule a daily 10:00 AM call to the `process-review-queue` edge function.

### 5. Database Webhook Triggers (via Edge Function)

Create `supabase/functions/booking-webhook/index.ts` that:
- Is called by Supabase database webhooks on INSERT to `bookings` and `rental_bookings`
- Sends customer confirmation + owner notification emails
- Inserts a row into `review_queue` with `scheduled_send = tour_date + 1 day`

Configure the webhooks in `supabase/config.toml`.

### 6. Admin Auth Pages

Create:
- `src/pages/AdminLogin.tsx` — full-screen login form with Gemscape branding, email + password, calls `supabase.auth.signInWithPassword()`
- `src/pages/Admin.tsx` — protected dashboard shell that checks auth session, redirects to `/admin/login` if not authenticated, shows a simple "Welcome, admin" placeholder
- Add routes in `App.tsx`: `/admin/login` → AdminLogin, `/admin` → Admin

### Files to Create/Edit
- Migration SQL (triggers)
- `supabase/functions/send-booking-email/index.ts`
- `supabase/functions/process-review-queue/index.ts`
- `supabase/functions/booking-webhook/index.ts`
- `src/pages/AdminLogin.tsx`
- `src/pages/Admin.tsx`
- `src/App.tsx` (add routes)
- `supabase/config.toml` (webhook config — auto-managed, so we skip this)

