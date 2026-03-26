

# Admin Dashboard Redesign — Implementation Plan

## Overview
Complete redesign of the admin panel into a world-class operations centre with a refined sidebar, white topbar, new metric cards, two-column dashboard layout with bookings table + right panels, and clean #f8f9fa background.

## Files to Modify

### 1. `src/pages/Admin.tsx` — Full rewrite
- Replace emoji-based NAV_SECTIONS with Lucide icon components (LayoutDashboard, Map, Car, CalendarDays, Users, TrendingUp, BarChart2, LineChart, Star, ArrowLeft, etc.)
- New sidebar structure:
  - Top: Gemscape gem SVG in teal rounded square + "Gemscape" bold 14px + "Admin Portal" 11px muted
  - Nav items: Lucide icons at 16x16, strokeWidth 1.5. Active = teal bg rgba(26,138,158,0.12) + teal text. Inactive = rgba(255,255,255,0.5)
  - Section labels: 10px uppercase tracking
  - Amber badge counts on sections with pending items (from Supabase data)
  - Bottom: user avatar circle (initials, teal bg), name, "Admin" role label
- New white topbar (52px, border-bottom 0.5px #e5e7eb):
  - Left: page title from activeTab mapping
  - Right: search input (200px, #f9fafb bg), Export outline button, "+ New Booking" teal button (appears on ALL pages)
- Main content background changed to #f8f9fa

### 2. `src/components/admin/AdminDashboard.tsx` — Major rewrite
- **Metric cards**: 4-card grid (not 6) with colored top borders:
  - Total Revenue (teal #1a8a9e), Active Bookings (gold #C9A84C), Pending Approval (amber #f59e0b with tint), Fleet Utilisation (green #3b6d11)
  - Each card: white bg, 0.5px #e5e7eb border, 10px radius, 14px 16px padding, 3px top accent
  - Progress bar (3px height) and delta line under each value
- **Two-column content below metrics**:
  - Left (flex:1): Bookings table card with filter pills (All/Rentals/Tours/Concierge), avatar+initials per guest, type icon+label, dates, bold amount, status pills with specified colors, row hover #f9fafb, row click opens 420px detail drawer
  - Right (320px): 3 stacked panels:
    1. Booking pipeline — 5 horizontal bars (Enquiry/Pending/Confirmed/Active/Completed) with color coding
    2. Live activity — last 5 actions feed with colored dots and timestamps
    3. Quick actions — 2x2 grid (New Booking, Send Confirmation, Fleet Status, View Calendar)
- **Revenue chart Y-axis fix**: Add `domain={[0, 'auto']}` and `tickFormatter` for currency formatting on the YAxis component

### 3. `src/index.css` — Admin styles update
- `.admin-sidebar`: width 220px, background #05181e
- `.admin-main`: background #f8f9fa (not cream)
- `.admin-nav-item`: remove text-transform uppercase, font-size 13px normal case, remove border-left indicator
- `.admin-nav-item.active`: background rgba(26,138,158,0.12), color #1a8a9e
- New classes: `.admin-topbar`, `.admin-metric-card-new`, `.admin-status-pill`, `.admin-pipeline-bar`, `.admin-activity-feed`, `.admin-quick-action`
- Card styles: border-radius 10px, border 0.5px solid #e5e7eb (replace gold-tinted borders)

## Technical Details

- Lucide imports: `import { LayoutDashboard, Map, Car, CalendarDays, Users, TrendingUp, BarChart2, LineChart, Star, ArrowLeft, Settings, Mail, Truck, Calendar, Search, Plus, Download } from "lucide-react"`
- The "+ New Booking" button in topbar triggers the existing `showNewBooking` state — will need to lift this state up to Admin.tsx or use a callback prop
- Booking detail drawer: use existing QuickFormModal pattern but read-only, slide from right
- Pipeline data computed from existing booking statuses (pending/confirmed/completed/cancelled)
- Fleet utilisation: `(vehicles rented today / total vehicles) * 100`
- Live activity: derived from most recent bookings + rental_bookings ordered by created_at

## Implementation Order
1. Update CSS admin styles first (sidebar width, backgrounds, card styles)
2. Rewrite Admin.tsx (sidebar + topbar + Lucide icons)
3. Rewrite AdminDashboard.tsx (metric cards, table, right panels, chart fix)

