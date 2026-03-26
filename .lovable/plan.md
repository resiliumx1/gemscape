

# Polish All Admin Interior Pages

## Overview
Upgrade all admin interior pages to match the redesigned dashboard quality: consistent card styles, avatar circles, status pills, booking count labels, status filter pills, enhanced drawers with status timeline and action buttons, and fixes for Review Requests bars and Revenue charts.

## Files to Modify

### 1. `src/components/admin/AdminTourBookings.tsx` — Full rewrite
- Remove page title (topbar handles it), add booking count label ("X bookings" muted text)
- Replace `<select>` filters with pill-style filter buttons (All / Pending / Confirmed / Completed / Cancelled) using `admin-period-btn` class
- Add avatar circles with initials + Map icon for type column
- Use colored status pills (`admin-status-*` classes)
- Row click opens enhanced drawer (420px, fixed right, white bg, border-left, box-shadow)
- Drawer contents: avatar + name + contact, Map icon + service name, date, pickup location, special requests, total amount large bold, status timeline (Enquiry → Confirmed → Active → Completed with teal highlight), action buttons: Confirm (teal filled), Send Confirmation Email (outline), Mark Active, Mark Completed, Cancel (red outline)
- Search filters in real time by guest name or booking ref

### 2. `src/components/admin/AdminRentalBookings.tsx` — Full rewrite
- Same treatment as Tour Bookings but with Car icon, vehicle name, date range (pickup–return)
- Drawer shows vehicle info, pickup/return locations, license details
- Same status timeline and action buttons

### 3. `src/components/admin/AdminAllBookings.tsx` — Full rewrite
- Same table design with combined tour+rental data
- Type column shows Map or Car icon with label
- Same drawer, same status timeline, same action buttons

### 4. `src/components/admin/AdminCustomerDirectory.tsx` — Polish
- Replace card grid with a searchable sortable table: avatar initials, full name, email, phone, flag emoji for country, booking count, total spend (bold, sorted descending), last booking date, "View →" button
- Guest profile panel (drawer): booking timeline, total spend, first booking date, preferred service type, WhatsApp button opening `https://wa.me/[phone]`

### 5. `src/components/admin/AdminLoyalty.tsx` — Polish empty state
- Add 4 metric cards above charts: Repeat Booking Rate, Average Lifetime Value, Top Guest by Spend, Average Bookings Per Guest — showing "—" with "Awaiting data" when empty, real values when data exists
- Empty state for Top 10 table: Gemscape gem icon + styled message "Your top guests will appear here after your first confirmed bookings."

### 6. `src/components/admin/AdminReviewRequests.tsx` — Fix bars + send button
- Change funnel bars from thin 6px to proper horizontal bars: height 32px, border-radius 6px, count label inside/beside
- Keep existing Send Now on review_queue items

### 7. `src/components/admin/AdminRevenue.tsx` — Fix charts
- Revenue by Service donut: add proper legend below with color swatch, label, count, and percentage
- ABV Trend chart Y-axis: add `tickFormatter={(v) => '$' + v.toLocaleString()}` and `domain={[0, 'auto']}`
- Monthly Revenue chart Y-axis: same currency formatter
- Update all card borders from `hsl(var(--gem-sand))` to `#e5e7eb` and border-radius to 10px

### 8. Global style cleanup across ALL pages
- Replace `border: "1px solid hsl(var(--gem-sand))"` with `border: "0.5px solid #e5e7eb"` everywhere
- Replace `fontFamily: "'Cormorant Garamond', serif"` with DM Sans in admin contexts
- All cards use `admin-card-elevated` class (10px radius, 0.5px border)
- No emoji icons remain (replace ◆ markers with Lucide Diamond or remove)
- Remove any warm cream/sand background references

## Technical Details
- Shared `BookingDrawer` component pattern used across all 3 booking pages to avoid duplication
- Status timeline component: 4 stages rendered as connected dots, current stage highlighted teal
- Action buttons in drawer use existing `admin-btn-teal`, `admin-btn-outline`, and a new red outline variant
- Customer table sort: click column headers to toggle ascending/descending
- WhatsApp link: strip non-digits from phone, prepend `https://wa.me/`
- Flag emoji: map country code to flag using regional indicator symbols or show country text

## Implementation Order
1. Update AdminTourBookings, AdminRentalBookings, AdminAllBookings (largest changes)
2. Update AdminCustomerDirectory (table conversion)
3. Update AdminLoyalty (metric cards + empty state)
4. Update AdminReviewRequests (bar fix)
5. Update AdminRevenue (chart fixes + style cleanup)

