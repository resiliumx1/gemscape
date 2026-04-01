

# Fix Double Gem + Mobile Performance

## Problem
1. The `BrilliantGem` Three.js component has `overflow: "visible"`, causing sparkle/glow effects to bleed outside the container — creating a "double gem" appearance on mobile/tablet.
2. The Three.js gem is heavy on mobile GPUs, contributing to poor performance scores. The site loads Three.js, post-processing shaders, and runs a continuous render loop even on low-powered devices.

## Plan

### Change 1: Clip overflow in `BrilliantGem.tsx`
- Line 575: Change `overflow: "visible"` to `overflow: "hidden"` to contain all sparkle/glow effects within the gem container bounds.

### Change 2: Hide gem on mobile in `HeroSection.tsx`
- Wrap the gem block (lines 155-164) in `{!isMobile && (...)}` so the Three.js canvas is completely removed from the DOM on mobile devices.
- This eliminates the render loop, dynamic imports of Three.js, and all GPU usage on mobile — the single biggest performance win.
- Tablet keeps the gem at 180px, desktop at 520px.

### Performance context
The slow performance score is primarily caused by the Three.js gem: it dynamically imports ~200KB of Three.js + post-processing modules, creates a WebGL context, and runs a continuous animation loop. Removing it on mobile will significantly improve LCP, TBT, and overall Lighthouse scores. On desktop, the gem already pauses when off-screen via IntersectionObserver, so the impact is lower there — desktop performance test failures are likely related to the initial Three.js bundle load time, which is mitigated by the existing lazy loading.

## Files Modified

| File | Change |
|------|--------|
| `src/components/BrilliantGem.tsx` | `overflow: "visible"` → `overflow: "hidden"` |
| `src/components/HeroSection.tsx` | Wrap gem in `{!isMobile && (...)}` |

## Technical Details
- No database changes needed
- No new dependencies
- Two single-line edits across two files

