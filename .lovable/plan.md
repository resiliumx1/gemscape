

# Admin Overhaul + Page Transitions — Implementation Plan

## Assessment

After reviewing the codebase, **most of Prompt 5 and all of Prompt 6 are already implemented**:
- Sidebar already uses Lucide icons with correct sizes
- Topbar exists with search, export, and "+ New Booking" button
- Metric cards are properly styled with color accents and progress bars
- Revenue chart has Y-axis currency formatter and auto-scale
- Booking detail drawer exists in Dashboard
- Page transitions (PageTransitionWave.tsx) already implement the exact canvas-based cover/reveal system with route palettes
- IntroSplash already has video at `/videos/intro.mp4` with autoPlay/muted/playsInline and error fallback

## What Actually Needs Fixing

### 1. "+ New Booking" button is broken from topbar (Admin.tsx)
The topbar button sets `showNewBooking` state in `Admin.tsx` (line 236), but **no modal is rendered** there. The `QuickFormModal` only exists inside `AdminDashboard.tsx`. When on any page other than Dashboard, clicking "+ New Booking" does nothing.

**Fix**: Add a `NewBookingModal` render in `Admin.tsx` that uses the existing `QuickFormModal` pattern. It should support Tour/Rental/Concierge booking types via radio buttons, insert into the correct table, and show a success toast.

### 2. No loading timeout on booking pages
`AdminTourBookings`, `AdminRentalBookings`, `AdminAllBookings` have try/catch but no timeout fallback. If Supabase hangs, the spinner runs forever.

**Fix**: Add `setTimeout(() => setLoading(false), 6000)` in the fetch `useEffect` of each booking page.

### 3. Service Breakdown card missing from Dashboard
No "Service Breakdown" or tours-vs-rentals breakdown exists. The dashboard shows Revenue Overview chart, bookings table, pipeline, activity, and quick actions — but no service breakdown card.

**Fix**: Add a simple two-row breakdown card between the revenue chart and the two-column section. Shows "Tours: X bookings" and "Rentals: X bookings" with colored left-border indicators (teal for tours, gold for rentals). Computes counts from the already-loaded data.

## Files to Modify

### `src/pages/Admin.tsx`
- Import `toast` from sonner and `supabase`
- Add a full `NewBookingModal` component rendered when `showNewBooking === true`
- Modal: booking type radio (Tour/Rental/Concierge), guest fields, service dropdown (populated from vehicles table for rentals), dates, amount, special requests
- On submit: insert into `bookings` or `rental_bookings` with status "confirmed", show toast, close modal, trigger data refresh

### `src/components/admin/AdminDashboard.tsx`
- Add a "Service Breakdown" card after the revenue chart (before the two-column section)
- Two rows: Tours count with teal left bar, Rentals count with gold left bar

### `src/components/admin/AdminTourBookings.tsx`
- Add 6-second timeout in `useEffect` calling `fetchBookings`

### `src/components/admin/AdminRentalBookings.tsx`
- Same 6-second timeout

### `src/components/admin/AdminAllBookings.tsx`
- Same 6-second timeout

## Implementation Order
1. Add loading timeouts to all 3 booking pages
2. Add Service Breakdown card to Dashboard
3. Build and render NewBookingModal in Admin.tsx

