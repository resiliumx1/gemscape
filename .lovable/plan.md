

# Critical Performance Fix: Reduce ~21MB Homepage to ~2.5MB

## What's Wrong
The homepage downloads ~21MB of assets (Google recommends <1.5MB for mobile). This is why speed tests fail — the page never finishes loading in time.

## Plan (7 Fixes, ordered by impact)

### Fix 1: Video preload — saves ~10.6MB
In `HeroSection.tsx` line 111, change `preload="auto"` to `preload="none"`. The video will stream on play instead of downloading entirely before the page becomes interactive. The poster image is already set.

### Fix 2: Already done
The `src/assets/` imports have already been moved to `/images/` public paths. No action needed.

### Fix 3: Optimize the logo PNG — saves ~1.5MB
`public/images/gemscape-logo.png` is 1.5MB for a logo displayed at 42px height. Compress it to WebP at 200px height, targeting <30KB. Update all references from `.png` to `.webp`.

### Fix 4: Replace Unsplash URLs with local placeholders — saves ~3MB + eliminates external requests
91 Unsplash references across 6 component files. Replace with local `/images/experiences/` paths using existing optimized assets. For fallback images (Rentals), use `/images/experiences/jeep-beach-palms.webp`. Files affected:
- `Experiences.tsx` — 7 URLs across card image arrays
- `RentalsPreview.tsx` — 7 URLs (3 defaults + 3 fallbacks + 1 error handler)
- `Packages.tsx` — 6 gallery URLs
- `Rentals.tsx` — 4 fallback URLs
- `CtaBanner.tsx` — 1 background URL
- `Concierge.tsx` — 1 hero URL

### Fix 5: Lazy-load Three.js gem with 2s delay — saves ~600KB JS + 500ms main thread
In `HeroSection.tsx`, replace the direct `import BrilliantGem` with `React.lazy()` + `Suspense`, and add a 2-second delay via `useState`/`useEffect` before showing the gem. This lets the page become interactive before Three.js loads.

### Fix 6: Disable Lenis smooth scroll on mobile — saves scroll jank
In `App.tsx`, add `window.innerWidth < 768` check to the Lenis initialization. Mobile uses native scroll (better performance), desktop keeps Lenis.

### Fix 7: Use optimized image assets from uploaded zip
Extract the uploaded `gemscape-optimized-assets.zip` to replace oversized images in `public/images/` and `public/images/experiences/` with compressed WebP versions. Also use smaller optimized versions from `public/assets/` where duplicates exist.

## Files Modified

| File | Change |
|------|--------|
| `src/components/HeroSection.tsx` | `preload="none"`, lazy-load gem with 2s delay |
| `src/App.tsx` | Disable Lenis on mobile |
| `src/components/Experiences.tsx` | Replace 7 Unsplash URLs |
| `src/components/RentalsPreview.tsx` | Replace 7 Unsplash URLs |
| `src/pages/Packages.tsx` | Replace 6 Unsplash URLs |
| `src/pages/Rentals.tsx` | Replace 4 Unsplash URLs |
| `src/components/CtaBanner.tsx` | Replace 1 Unsplash URL |
| `src/pages/Concierge.tsx` | Replace 1 Unsplash URL |
| `public/images/` | Optimized assets from zip |

## What Won't Change
- Visual design and layout
- BrilliantGem internals
- Wave transitions, admin panel, Supabase integration
- GSAP/Framer Motion usage

## Expected Results
- Total download: ~21MB → ~2.5MB
- Time to Interactive: >15s → <4s on mobile
- Lighthouse performance score should pass

