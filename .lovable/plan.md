

# Admin Panel Overhaul — Changes 1–6

## Overview
Six changes to the admin panel: dynamic forecasting, report text visibility fix, booking detail drawer in Operations, enhanced reviews, detailed fleet manager, and currency toggle in header.

---

## Change 1: Forecasting — Full Revenue Forecasting System
**File:** `src/components/admin/AdminForecasting.tsx` (full rewrite)

- Fetch actual revenue from `bookings`, `rental_bookings`, and `package_bookings` tables, grouped by month
- Add 4 KPI cards at top: Projected Annual Revenue, Best Month, Average Monthly, Growth Rate
- Add segmented control: Monthly | Quarterly | Yearly view toggles
- Auto-forecast using 3-month rolling average × 1.05 growth when no custom values exist
- Add Custom Projection Editor table (editable number inputs per month, columns: Tours/Rentals/Packages/Total)
- "Save Draft Projections" (localStorage) and "Reset to Auto" buttons
- Add revenue breakdown donut/bar below main chart (Tours=teal, Rentals=gold, Packages=bronze, Concierge=purple)
- Use recharts AreaChart with actual (solid teal) vs forecast (dashed bronze) lines
- All styling uses `var(--aura-*)` variables for dark/light compatibility

---

## Change 2: Report Subtitle Visibility Fix
**Files:** `src/components/admin/AdminReports.tsx`, `src/components/admin/ReportCard.tsx`

- In `ReportCard.tsx` line 75: change description text from `color: 'var(--aura-text-muted)'` to `color: 'var(--aura-text)', opacity: 0.65` and bump `fontSize` from `10.5` to `13`
- In `AdminReports.tsx`: bump "Recent Downloads" subtitle text and "Report Period" label sizes from 10-11px to 13px, apply same brighter color treatment
- Also bump the `Re-download` button font from 9.5px to 12px

---

## Change 3: Operations — Click Booking for Full Details
**Files:** `src/components/admin/AdminAllBookings.tsx`, `src/components/admin/BookingDrawer.tsx`

- Add `selectedBooking` state to `AdminAllBookings`
- Make each booking row/card clickable to open `BookingDrawer` via `setSelectedBooking`
- Render `<BookingDrawer>` when a booking is selected, passing appropriate `type` ("tour" or "rental")
- Update `BookingDrawer.tsx`:
  - Restyle for aura theme (replace hardcoded `#0f172a`, `#94a3b8`, `#f1f5f9` with `var(--aura-text)`, `var(--aura-text-muted)`, `var(--aura-glass-border)`)
  - Show ALL fields: full name, email, phone, country, service type, tour date, party size, pickup location, flight details, special requests (full text), add-ons, total estimate, booking ref, status, created date
  - Apply uniform uppercase field labels: `textTransform: "uppercase", letterSpacing: "0.08em", fontSize: 11, fontWeight: 600`

---

## Change 4: Reviews — Tailored Messages + External Reviews + Filtering
**File:** `src/components/admin/AdminReviewRequests.tsx` (significant rewrite)

- **Tailored review modal:** When clicking "Respond," show an editable pre-filled message template using customer name, service type, and tour date. Include Google Review and TripAdvisor link buttons. Admin can edit before sending.
- **External reviews section:** Add "Published Reviews" card grid at top with "Add External Review" button. Manual entry modal: Platform (Google/TripAdvisor), Reviewer name, Rating (1-5 stars), Review text, Date. Store in localStorage for MVP.
- **Filter pills:** "All" | "Good (4-5★)" | "Great (5★)" | "Needs Attention (1-3★)"
- **Approve toggle:** Each review gets an Approved/Pending Review badge

---

## Change 5: Fleet Manager — Detailed Form + Fuel Control
**File:** `src/components/admin/AdminFleetManager.tsx`

- Expand edit/add modal with all fields:
  - Row 1: Vehicle Name | Category (dropdown: SUV, Jeep, Sedan, Van, Convertible)
  - Row 2: Seats | Daily Rate
  - Row 3: Transmission (Automatic/Manual) | Fuel Type (Gasoline/Diesel/Hybrid/Electric)
  - Row 4: License Plate | Year
  - Row 5: Luggage Capacity | AC (toggle)
  - Row 6: Image URL
  - Row 7: Description (textarea)
  - Row 8: Features (comma-separated)
  - Row 9: Fuel Level (dropdown: Empty/Low/Quarter/Half/Three-Quarter/Full)
- Replace random fuel percentage with admin-controlled value stored in localStorage keyed by vehicle ID
- Display the stored fuel level on fleet cards instead of random values

---

## Change 6: Currency Toggle in Admin Header
**File:** `src/components/admin/AdminHeader.tsx`

- Import `useCurrency` from `@/contexts/CurrencyContext`
- Add a USD/XCD toggle button in the header bar, placed before the NotificationBell on both desktop and mobile layouts
- Styled with `var(--aura-*)` variables, matching the existing header button aesthetic

---

## Files Modified (Summary)

| File | Change |
|------|--------|
| `src/components/admin/AdminForecasting.tsx` | Full rewrite with real data, projections, view toggles, breakdown |
| `src/components/admin/AdminReports.tsx` | Brighter subtitle text, bumped font sizes |
| `src/components/admin/ReportCard.tsx` | Brighter description text, bumped font sizes |
| `src/components/admin/AdminAllBookings.tsx` | Add click-to-open BookingDrawer |
| `src/components/admin/BookingDrawer.tsx` | Restyle for aura theme, show all fields, uppercase labels |
| `src/components/admin/AdminReviewRequests.tsx` | Tailored messages, external reviews, filter/approve |
| `src/components/admin/AdminFleetManager.tsx` | Detailed form fields, fuel level control |
| `src/components/admin/AdminHeader.tsx` | Add currency toggle button |

No database migrations needed for changes 1-6 (external reviews stored in localStorage for MVP, fuel levels in localStorage, projections in localStorage).

