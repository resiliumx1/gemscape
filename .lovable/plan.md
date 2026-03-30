

# Fix: Intro Video Not Playing (Blue Screen)

## Root Cause Analysis

After inspecting the code and network requests, I found **three compounding issues** preventing the intro video from playing:

1. **`<source>` errors are silent.** The video uses a `<source>` child element, but the `onError` handler is on the `<video>` parent. In all major browsers, `<source>` load failures do NOT bubble up to the `<video>` element's `onError` — they silently fail. So if the video can't load, the component just shows the navy blue background (`#05181e`) with no error ever logged.

2. **The 4-second auto-dismiss kills the component too early.** There's a `setTimeout` at 4s that force-completes the intro if the video hasn't finished. On slower connections or with large files, the video hasn't even buffered by then. The user sees blue for 4 seconds, then the splash vanishes — no video ever played.

3. **No `loadeddata` confirmation.** The logo fallback (zIndex 1) sits behind the video (zIndex 2), but the video element has no visible dimensions until it actually loads frames. So the user sees: blue background → maybe logo briefly → blue background with invisible 0×0 video → auto-dismiss at 4s.

## Fix Plan

### File: `src/components/IntroSplash.tsx`

**A. Switch from `<source>` to direct `src` on the video element**
Replace the `<source src="/videos/intro.mp4">` child with a `src="/videos/intro.mp4"` attribute directly on the `<video>` tag. This ensures `onError` fires properly on the video element itself.

**B. Add proper load/error detection with fallback**
- On `loadeddata` event: hide the logo, confirm video is actually rendering frames
- On `error` event: immediately skip the intro (don't wait 4 seconds staring at blue)
- Keep the skip button as a safety valve

**C. Extend or remove the aggressive 4s timeout**
Change the auto-dismiss from 4s to 10s. This gives the video time to buffer on mobile/slow connections. The skip button (appears at 2s) provides the escape hatch if users don't want to wait.

**D. Add an interaction-based fallback for blocked autoplay**
Same pattern used in HeroSection — if `play()` is rejected, add a one-time click/touch listener to retry.

### Summary of changes

```
src/components/IntroSplash.tsx
├── <video> gets src= attribute directly (remove <source> child)
├── onError fires reliably → immediate skip on failure
├── onLoadedData hides logo, confirms playback
├── Auto-dismiss timeout: 4s → 10s
└── Autoplay-blocked fallback: retry on first user interaction
```

Single file edit, no other files affected.

