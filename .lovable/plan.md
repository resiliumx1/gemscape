

## Cinematic Intro — Upgraded Version (3.5s total)

The user's pasted code had all JSX tags stripped by the chat interface, leaving only text fragments. I'll reconstruct the complete working component based on the user's detailed spec: Particles, GemShards, LightRays, WaveCanvas sub-components, and a 3.5-second phase timeline.

### What changes

**1. Copy uploaded logo to project**
- Copy `user-uploads://gemscape-logo_fixed.png` → `public/images/gemscape-logo.png` (replacing existing)

**2. Replace `src/components/CinematicIntro.jsx` entirely**
New component with these sub-components and effects:
- **Particles** — 140 twinkling particles (white/gold/teal mix)
- **GemShards** — 8 orbiting diamond shards around the logo
- **LightRays** — 12 radial light beams pulsing behind the logo
- **WaveCanvas** — 4-layer canvas wave wipe (700ms duration)
- **Phase timeline** (3.5s total):
  - 0.1s → `reveal` (logo fades up)
  - 0.5s → `glow` (shards orbit out, ambient blooms breathe)
  - 1.4s → `shimmer` (gold sweep, rule line, slogan, dots, rays)
  - 2.7s → `wave` (canvas wave wipes up)
  - 3.5s → `done` (unmounts, calls `onComplete`)
- Background: deep navy radial gradient with vignette, teal bloom top, gold bloom bottom
- Logo uses `/images/gemscape-logo.png` at `clamp(280px, 50vw, 620px)` width
- Slogan: "Where Every Journey Becomes a Gem" with letter-spacing animation
- CSS keyframes for: twinkle, float, glow-pulse, shimmer-sweep, slogan-in, rule-in, dot-pulse, ray-pulse, ambient-breathe

**3. Update `src/App.tsx`**
- Add `useState`, `useCallback` imports
- Add `import CinematicIntro from "@/components/CinematicIntro"`
- Add `showIntro` state (checks `sessionStorage.introPlayed` and pathname !== '/admin')
- Add `handleIntroComplete` callback that sets `sessionStorage.introPlayed` and hides intro
- Render `{showIntro && <CinematicIntro onComplete={handleIntroComplete} />}` before the router

### Technical notes
- All animations are pure CSS + Canvas — no external dependencies
- The uploaded logo PNG replaces the existing one (which may have had quality issues)
- sessionStorage ensures intro plays once per browser session

