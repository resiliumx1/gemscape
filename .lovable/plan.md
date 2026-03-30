

# Root Cause Analysis & Fix Plan

## WHY THE FIXES AREN'T WORKING

I found **3 critical architectural bugs** that explain ALL the issues:

### Bug 1: NewBookingModal is OUTSIDE the theme wrapper
In `Admin.tsx`, the `NewBookingModal` renders at line 208 — **AFTER** the closing `</div>` of the `.aura-admin` wrapper (line 206). This means all `.aura-light .aura-modal-panel` CSS rules **never apply** to the booking modal. The modal sits outside the light mode class scope entirely. This is why you can't see anything in light mode.

```text
<div class="aura-admin aura-light">   ← line 173
  <aside>sidebar</aside>
  <main>content</main>
</div>                                 ← line 206 — CLOSES here
<NewBookingModal />                    ← line 208 — OUTSIDE .aura-light!
```

### Bug 2: Scroll architecture is broken
The `.aura-main` has `min-height: 100vh` with NO overflow. The `.aura-content` inside it has `overflow-y: auto; height: calc(100vh - 56px)`. But on mobile, the topbar height is NOT 56px — it's auto/variable (search bar + buttons = ~120px). So `calc(100vh - 56px)` gives the content area TOO MUCH height, and the scroll doesn't behave correctly. The sidebar uses `position: sticky` which only works when the **page** scrolls — but since scroll is trapped inside `.aura-content`, the page never scrolls, so sticky is irrelevant.

**Fix**: Remove the trapped scroll. Let the page itself scroll (`.aura-main` gets `overflow-y: auto; height: 100vh`). Make the topbar `position: sticky; top: 0` so it stays fixed. The sidebar already has `position: sticky; height: 100vh` which will work once the scroll is on `.aura-main`.

### Bug 3: Header layout uses `isMobile` only (no tablet breakpoint)
The header switches between a fully stacked mobile layout and full desktop at exactly 768px. There is no tablet handling, causing layout issues between 768-1024px where elements crowd together.

---

## Exact Changes

### File 1: `src/pages/Admin.tsx`
- **Move `NewBookingModal` INSIDE the `.aura-admin` div** (before the closing `</div>` at line 206). This is the #1 fix for light mode visibility.
- Remove `overflowX: "hidden"` inline style from `.aura-admin` div — let CSS handle it.

### File 2: `src/styles/admin-aura.css`

**Fix scroll architecture:**
- `.aura-main`: change to `height: 100vh; overflow-y: auto; overflow-x: hidden` (remove `min-height`)
- `.aura-topbar`: add `position: sticky; top: 0; z-index: 50; flex-shrink: 0`
- `.aura-content`: remove `overflow-y: auto; height: calc(100vh - 56px)` — just use `flex: 1; padding: 20px`
- This makes the main area scroll naturally, topbar sticks at top, sidebar sticks via its existing sticky

**Strengthen light mode modal overrides:**
- Add fallback rule: elements with `class="aura-modal-panel"` that are inside `.aura-light` now work because the modal is inside the wrapper
- Add a GLOBAL rule as safety net: `.aura-light .aura-modal-panel, .aura-modal-panel[data-theme="light"]` for any edge cases

**Tablet header responsive:**
- Add `@media (min-width: 768px) and (max-width: 1024px)` rules for `.aura-topbar`: reduce title font to 22px, reduce gaps, keep same desktop layout structure

### File 3: `src/components/admin/AdminHeader.tsx`
- Add `isTablet` detection (768-1024px range) — either receive it as prop or detect internally
- For tablet: use desktop layout but with smaller font sizes and tighter spacing
- Ensure consistent header layout: title + search + new booking + bell + avatar all on one row at tablet+

---

## Summary of What Each Fix Solves

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Light mode modals invisible | Modal outside `.aura-light` wrapper | Move inside wrapper |
| Can't scroll content | Scroll trapped in wrong container | Move scroll to `.aura-main` |
| Sidebar doesn't follow scroll | `sticky` irrelevant when page doesn't scroll | Fix scroll container |
| Header layout inconsistent on tablet | No tablet breakpoint | Add 768-1024px responsive rules |
| Fleet/Calendar modals in light mode | Already inside wrapper — CSS works | Already fixed by existing CSS |

