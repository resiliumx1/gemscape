

# Fix Hero Color Tint + Intro Video Playback

## Issue 1: Orange/Yellow Hue on Hero

Comparing your screenshots, the current hero has a warm orange cast that shouldn't be there. The root cause is the video element's `opacity: 0.38` — this makes the aerial footage nearly transparent, letting the parent's dark green `bg-[#022c22]` bleed through heavily. Combined with the gradient overlay on top, the natural blue-green ocean tones shift warm.

### Fix in `src/components/HeroSection.tsx`
- Increase the video `opacity` from `0.38` to `0.65` so the natural video/poster colors dominate
- Adjust the gradient overlay to be lighter (reduce the alpha values) so it darkens for text readability without adding a color cast
- Change the overlay gradient from the current heavy `rgba(5,24,30,...)` to softer values: top 0.3, middle 0.15, bottom 0.55, base 0.80

## Issue 2: Intro Video Still Not Playing

The video files exist at `public/videos/intro.mp4`. Two likely causes remain:

**A. `sessionStorage` prevents replay**: Once `introPlayed` is set to `"true"`, the intro never shows again in that browser tab. The user may have triggered this during earlier testing and now never sees the intro at all (App.tsx line 30-32 checks this on mount).

**B. Hero video still uses `<source>` child tag**: On line 113 of HeroSection.tsx, the hero video still has `<source src="/videos/antigua-aerial.mp4">` as a child element instead of a direct `src` attribute — the same silent-failure pattern we fixed in IntroSplash. This needs the same fix.

**C. Video codec / size in preview**: If the intro.mp4 uses H.265/HEVC codec, some browsers won't play it and won't fire `onError`. Adding a `canplay` + `play()` retry and logging will surface this.

### Fixes

**`src/components/IntroSplash.tsx`**:
- Add `onCanPlay` handler alongside `onLoadedData` — both set `videoReady(true)` and call `play()`
- Add console.log statements to track: video element mount, loadeddata fired, canplay fired, error fired — to diagnose if the video is actually loading
- Ensure the `useEffect` autoplay logic also calls `play()` inside the `canplay` listener after setting videoReady

**`src/components/HeroSection.tsx`**:
- Move `src="/videos/antigua-aerial.mp4"` from `<source>` child to direct `src` attribute on `<video>` (same pattern as IntroSplash fix)
- Increase video opacity from `0.38` to `0.65`
- Lighten the gradient overlay alpha values

### Summary

| File | Changes |
|------|---------|
| `src/components/HeroSection.tsx` | Fix `<source>` → direct `src`, increase video opacity to 0.65, lighten overlay gradient |
| `src/components/IntroSplash.tsx` | Add `onCanPlay` handler, add diagnostic console.logs |

