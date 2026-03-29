

## Fix: Mobile Admin Navigation, Booking Button, Home Button & Notification z-index

### Problems Identified
1. **No mobile nav menu** — The hamburger button opens a sidebar drawer, but it may not be rendering properly or is hidden behind other elements.
2. **"New Booking" button invisible on mobile** — The gold button in Row 2 of the mobile header may be clipped or hidden.
3. **Home button on mobile should go to Dashboard**, not `/` — Add a separate "Back to Site" button instead.
4. **Notification dropdown z-index too low** — Currently `z-index: 50`, gets layered behind the avatar/profile. Needs to be much higher (e.g., `z-index: 9999`).

### Plan

#### 1. Fix Notification dropdown z-index (`AdminHeader.tsx`)
- Change the notification dropdown `zIndex` from `50` to `9999` (both mobile fixed and desktop absolute positions).

#### 2. Fix mobile header layout (`AdminHeader.tsx`)
- **Home button on mobile**: Change the hamburger menu area to include a Home icon button that navigates to Dashboard (`onNavigateDashboard` callback), not `/`.
- **Add "Back to Site" button**: Add a small globe/external-link icon button in the mobile header that navigates to `/`.
- **Ensure "New Booking" button is visible**: Verify Row 2 renders properly — ensure the parent `aura-topbar` allows `flex-wrap` or column layout on mobile so nothing is clipped.

#### 3. Update `Admin.tsx` to pass new prop
- Add `onNavigateDashboard` prop to `AdminHeader` that calls `setActiveTab("dashboard")`.

#### 4. Verify mobile sidebar drawer works
- Ensure the sidebar backdrop and drawer have proper z-index values so they render above all content when `drawerOpen` is true. Check CSS for `.aura-sidebar--mobile` and `.aura-sidebar-backdrop`.

### Files to Edit
- `src/components/admin/AdminHeader.tsx` — Fix notification z-index, restructure mobile header buttons
- `src/pages/Admin.tsx` — Pass new `onNavigateDashboard` prop

