

# Fix Logo Transparency

## Problem
The screenshot clearly shows a **dark rectangular box** on the left side of the logo in the intro splash. The current `gemscape-logo.png` file has a partially opaque background baked into the image itself — no amount of CSS `background: transparent` will fix this.

The user previously uploaded a new file (`gemscape_logo_transparent.png`) which was copied over the old one, but the issue persists — meaning either the copy didn't work correctly, or the new file also has transparency issues.

## Root Cause
The PNG asset itself contains a non-transparent matte/background region. This is an **image file problem**, not a CSS problem.

## Solution

### 1. Re-upload the user's transparent logo
Copy the user's latest upload (`user-uploads://gemscape_logo_transparent.png`) to `public/images/gemscape-logo.png` again, overwriting the current file.

### 2. Add CSS safety net across all logo instances
Even with a properly transparent PNG, add `mix-blend-mode: normal` and remove any `filter: brightness()` that could expose edge artifacts. Update all `<img>` tags for the logo in:
- `Navbar.tsx` (line 97)
- `Footer.tsx`
- `Admin.tsx` (sidebar)
- `Concierge.tsx` (hero)
- `IntroSplash.tsx`
- `CinematicIntro.jsx`

### 3. Verify the header placement
Confirm the logo is rendering in the navbar header (it already is at line 97 of `Navbar.tsx`). No structural change needed — just the asset replacement.

## Files
- `public/images/gemscape-logo.png` — overwrite with user upload
- `src/components/Navbar.tsx` — minor style cleanup
- `src/components/Footer.tsx` — minor style cleanup
- `src/pages/Admin.tsx` — remove `filter: brightness(1.1)` from sidebar logo
- `src/components/CinematicIntro.jsx` — style cleanup
- `src/components/IntroSplash.tsx` — style cleanup
- `src/pages/Concierge.tsx` — style cleanup

