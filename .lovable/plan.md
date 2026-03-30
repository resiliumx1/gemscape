

# Show Hero Video on Mobile

## What's happening now
The `HeroSection.tsx` component uses `useIsMobile()` to conditionally render either a `<video>` (desktop) or a static background image with a Ken Burns CSS animation (mobile). This was done as a data/performance precaution, but modern mobile browsers handle `autoPlay muted playsInline` videos without issue.

## Fix
Remove the conditional branch in `HeroSection.tsx` so the `<video>` element renders on all screen sizes. Delete the Ken Burns fallback `<div>` and its associated `@keyframes kenBurns` CSS.

The video element already has `playsInline`, `muted`, and `autoPlay` — the three attributes required for mobile autoplay to work. The `poster` image will still display while the video loads, providing a good fallback.

### File: `src/components/HeroSection.tsx`
- Replace the `{!isMobile ? <video> : <div kenBurns>}` conditional with just the `<video>` element (always rendered)
- Remove the `useIsMobile` import if no longer used elsewhere in this component
- Remove the `@keyframes kenBurns` and `.hero-ken-burns` CSS from the inline `<style>` tag
- Keep the `isMobile` check if it's still used for gem sizing — otherwise remove it entirely

