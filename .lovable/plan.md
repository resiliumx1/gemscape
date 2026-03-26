

# Multi-Prompt Implementation Plan

This plan covers 4 prompts: hero wave colour fix, section divider removal, rentals page fixes, and complete concierge page rebuild.

---

## PROMPT 2 — Wave Colours + Section Divider Lines

### Issue 1: Wave colours
The `WaveDivider` component uses a `sand` palette (cream tones) everywhere. Add a new `"ocean"` variant to `WaveDivider.tsx` with these 5 layer colours:
- `rgba(3,14,20,0.97)`, `rgba(5,22,32,0.92)`, `rgba(8,40,55,0.82)`, `rgba(13,72,88,0.65)`, `rgba(26,138,158,0.35)`

Then update all homepage WaveDivider usages to use `variant="ocean"`:
- `Services.tsx` line 128
- `Manifesto.tsx` line 65
- `Testimonials.tsx` line 75
- `Hero.tsx` line 120 (if still used)

**Files**: `WaveDivider.tsx`, `Services.tsx`, `Manifesto.tsx`, `Testimonials.tsx`, `Hero.tsx`

### Issue 2: Section divider lines
Remove these specific borders/lines in `index.css`:
1. `.services__row` — remove `border-bottom: 1px solid hsl(var(--gem-sand))` (line 770)
2. `.services__row::before` — remove the gold left-border indicator (lines 781-794, set `display: none` or remove)
3. `.eyebrow::before` — the gold dash before "OUR SERVICES" etc. Keep this globally but verify no `<hr>` elements exist
4. `.testimonial__sep` — keep this (it's inside a testimonial card, not a section divider)

Ensure each major section has `padding: 100px 0` minimum and its own background colour for natural separation.

---

## PROMPT 3 — Rentals Page Fixes

### Fix 1: Vehicle photos
Update `RentalsPreview.tsx` VEHICLES_DATA images to Caribbean/tropical Unsplash URLs:
- Toyota Land Cruiser: `https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=85` (already decent) → replace with beach SUV
- Jeep Wrangler: tropical jeep image
- Hyundai Tucson: coastal road image
- Replace the laptop screenshot image (`photo-1488590528505-98d2b5aba04b`) with a proper vehicle photo

Add `{/* REPLACE WITH REAL VEHICLE PHOTO */}` comments.

**File**: `RentalsPreview.tsx`

### Fix 2: Vehicle pricing visible
Already implemented — `Rentals.tsx` line 252-257 shows "From $X / day" with `formatPrice(v.daily_rate)`. The data comes from Supabase `vehicles` table. No change needed here.

### Fix 3: Booking summary reactive
Already implemented — `RentalBookingForm.tsx` lines 72-89 calculate `totalDays`, `baseTotal`, `estimatedTotal` reactively. The summary sidebar (lines 494-531) already shows real values when vehicle + dates are selected and "—" otherwise. This is working correctly. No change needed.

### Fix 4: Vehicle dropdown
Already implemented — `RentalBookingForm.tsx` lines 216-231 use Shadcn `Select` component. May need styling refinement for dark background. Update the `.rb-shadcn-select` CSS class to match specified styles: `background: rgba(255,255,255,0.06); border: 1px solid rgba(201,168,76,0.3); color: white; border-radius: 4px`.

**Files**: `RentalsPreview.tsx`, `index.css` (minor styling)

---

## PROMPT 4 — Complete Concierge Page

### Database migration
Create `concierge_enquiries` table:
```sql
CREATE TABLE public.concierge_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  whatsapp text,
  arrival_date date,
  departure_date date,
  flight_number text,
  guests integer,
  requirements text,
  status text DEFAULT 'new'
);
ALTER TABLE public.concierge_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit enquiries" ON public.concierge_enquiries FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can view enquiries" ON public.concierge_enquiries FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage enquiries" ON public.concierge_enquiries FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
```

### Full page rewrite: `Concierge.tsx`
Replace "Coming Soon" placeholder with 4 sections:

**Section 1 — Hero**: Full-bleed photo (private jet/luxury airport Unsplash), gradient overlay left-to-right, eyebrow "FLIGHT CONCIERGE", headline "Your Arrival, Handled Perfectly." in Cormorant Garamond 64px, subtext, two CTAs (ENQUIRE NOW gold filled, WHATSAPP US gold outline).

**Section 2 — What's Included**: Dark `#061418` background, 4-column grid of service cards with Lucide icons (Plane, Star, Car, Key), gold icon colour, white titles, muted descriptions. Card styles: `background: rgba(255,255,255,0.04); border: 1px solid rgba(201,168,76,0.2); border-radius: 10px; padding: 32px 24px`. Hover: border brightens.

**Section 3 — How It Works**: 3 horizontal steps with gold numbers, bold titles, muted descriptions, connected by dashed gold line. Background `#071e28`.

**Section 4 — Enquiry Form**: Two-column layout. Left: heading + contact info. Right: form with Name, Email, WhatsApp, Arrival Date (Shadcn date picker), Departure Date, Flight Number, Guests, Requirements textarea. Submit inserts into `concierge_enquiries` table. Success message shown on submit.

### CSS additions
Add concierge section styles to `index.css`:
- `.concierge-hero`, `.concierge-services`, `.concierge-steps`, `.concierge-enquiry` section styles
- Service card hover effects
- Step connector dashed line styles

**Files**: `Concierge.tsx` (full rewrite), `index.css` (new styles), database migration

---

## Implementation Order
1. Database migration for `concierge_enquiries`
2. `WaveDivider.tsx` — add ocean variant
3. `index.css` — remove section divider lines, add concierge styles, fix select styling
4. `Services.tsx`, `Manifesto.tsx`, `Testimonials.tsx` — change wave variant to ocean
5. `RentalsPreview.tsx` — fix vehicle images
6. `Concierge.tsx` — full page rewrite

