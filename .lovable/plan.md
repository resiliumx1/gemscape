

# Fix Plan: Admin CRM Visibility, Layout & Scrolling Issues

## Issues Identified from Screenshots

1. **New Booking modal in light mode** — text, inputs, labels invisible (image-4.png)
2. **Reports section** — card text barely visible in light mode, hardcoded dark colors (image-5.png)
3. **Communications popup** — not centered on mobile, title not visible enough (image-6.png)
4. **Add Vehicle modal** — title invisible, background too dark, must scroll to see Save button (image-7.png)
5. **Calendar views** — the calendar grid itself is not scrollable (image-8.png)
6. **Revenue Analytics header** — "New Booking" button overlaps with KPI cards (image-9.png)
7. **Sidebar icons too small in light mode on mobile** — collapse button hard to tap (image-10.png)
8. **Sidebar not scrollable** — footer items unreachable in any section
9. **Header layout inconsistencies** — Revenue, Reviews, Communications, Email History pages have different header behavior on tablet

---

## Plan

### File 1: `src/styles/admin-aura.css`

**Light mode modal/dropdown overrides — strengthen:**
- Add `!important` overrides for `.aura-light .aura-modal-panel` to force `--aura-modal-bg` (near-white) background, dark text color on ALL children including `input`, `label`, `h2`, `p`, `button`, and `span` elements
- Override `.aura-light .aura-input` inside modal panels to use a visible border (`rgba(0,60,65,0.15)`) and slightly tinted background (`rgba(0,40,50,0.06)`)
- Ensure `.aura-input-label` in light mode uses dark color

**Sidebar scrollability fix:**
- On `.aura-sidebar`, change `overflow: hidden` to `overflow-y: auto` so entire sidebar scrolls when nav + footer exceed viewport
- Keep `.aura-sidebar__nav` with `flex: 1; overflow-y: auto` but also ensure footer is always reachable
- Increase mobile collapsed icon size from 22px to 24px and button target from 44px to 48px

**Sidebar mobile light mode:**
- Add `.aura-light .aura-sidebar.collapsed .aura-nav-item__icon` with `opacity: 0.7` (currently 0.5, too faint in light mode)

**Calendar scrollable grid:**
- Add a new CSS class `.aura-calendar-grid` with `max-height: calc(100vh - 200px); overflow-y: auto` for all three views

**Content area:**
- Ensure `.aura-content` has `overflow-y: auto; height: calc(100vh - 56px)` to prevent page-level scroll issues

### File 2: `src/components/admin/AdminHeader.tsx`

**New Booking modal light mode fix:**
- Add `className="aura-modal-panel"` (already present) — the CSS overrides need strengthening (handled in CSS)
- Ensure all inline `color: "var(--aura-text)"` references work in light mode by not overriding with hardcoded dark values

**Tablet header consistency:**
- Add a `isTablet` breakpoint check (768-1024px) alongside `isMobile`
- On tablet, use a compact version of the desktop header: smaller title font, tighter gaps, but same layout structure as desktop (not the mobile stacked layout)

### File 3: `src/components/admin/ReportCard.tsx`

**Fix hardcoded dark-only colors:**
- Replace `color: '#dff3f8'` (title) with `color: "var(--aura-text)"`
- Replace `color: 'rgba(223,243,248,0.45)'` (description) with `color: "var(--aura-text-muted)"`
- Replace `color: 'rgba(223,243,248,0.3)'` (last run) with `color: "var(--aura-text-muted)"`
- Replace `border: '1px solid rgba(255,255,255,0.06)'` with `border: "1px solid var(--aura-glass-border)"`
- Adjust gradient backgrounds to use CSS variable-aware opacity so they're visible in both modes

### File 4: `src/components/admin/AdminFleetManager.tsx`

**Add Vehicle modal fixes:**
- Replace hardcoded `background: "rgba(8,32,38,0.95)"` with `background: "var(--aura-modal-bg)"`
- Add `className="aura-modal-panel"` to the modal panel div so light mode CSS overrides apply
- Set `maxHeight: "90vh"` and ensure the modal is centered with `alignItems: "center"` (already is, but ensure inner content doesn't overflow — add inner scroll)
- Ensure title `color: "var(--aura-text)"` works in light mode through CSS override chain

### File 5: `src/components/admin/AdminCalendar.tsx`

**Calendar grid scrollability:**
- Wrap month view grid in a scrollable container with `maxHeight: "calc(100vh - 220px)"; overflowY: "auto"`
- Week view already has `maxHeight` on time grid — keep but make the header sticky
- Day view already has `maxHeight` — keep but verify it works

**Message modal light mode:**
- Replace hardcoded `background: "rgba(8,32,38,0.96)"` with `background: "var(--aura-modal-bg)"`
- Add `className="aura-modal-panel"` to pick up light mode overrides

### File 6: `src/components/admin/AdminCustomerDirectory.tsx`

**Mobile centering:**
- The compose message panel is already inside `aura-glass` — on mobile, ensure it's centered by adding `margin: "0 auto"` and proper max-width
- No popup behavior needed — it's inline content

### File 7: `src/pages/Admin.tsx`

**Sidebar overflow fix:**
- Change sidebar `overflow: hidden` to allow scrolling when content exceeds height
- Ensure `handleNavClick` on mobile auto-collapses properly (already does)

**Tablet breakpoint:**
- Add `isTablet` state (768-1024px) and pass it to `AdminHeader`

---

## Technical Details

- All modal backgrounds switch from hardcoded rgba dark values to `var(--aura-modal-bg)` which is `rgba(252,254,254,0.98)` in light mode
- All modals get `className="aura-modal-panel"` so the existing `.aura-light .aura-modal-panel` CSS cascade forces readable text
- ReportCard uses CSS variable colors instead of hardcoded hex to respect theme
- Calendar grids get explicit `max-height` + `overflow-y: auto` for internal scrolling
- Sidebar gets `overflow-y: auto` on the root `<aside>` element
- Mobile sidebar icons increase to 24px with 48px tap targets

