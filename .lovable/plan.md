

## Fix Wave Transition Navigation System

### Problem
`GemscapeWave.tsx` exports `useWave()` with a no-op default context. Its `WaveTransitionProvider` is never mounted in `App.tsx`, so components like HeroSection and Services that import `useWave` from GemscapeWave get a dead `navigateTo` function. Buttons do nothing.

### Solution — 3 file changes

**File 1: Replace `src/components/GemscapeWave.tsx`**
Replace the entire 269-line canvas-based file with a 2-line re-export shim:
```tsx
export { useWave } from '@/components/WaveTransition';
```
This redirects all existing imports to the working system.

**File 2: Update `src/components/WaveTransition.tsx`**
- Add `useCallback` to the React import (line 2)
- Add `import { useNavigate, useLocation } from 'react-router-dom';` after clsx import (line 3)
- Export two navigation hooks at the bottom of the file (after line 285):
  - `useWave()` — returns `{ navigateTo }` using react-router
  - `useWaveNav()` — identical alias for newer components
  
Both hooks skip navigation if already on the target path.

**File 3: Replace `src/components/PageTransitionWave.tsx`**
Replace the 32-line file with a version that:
- Re-exports `useWaveNav` from WaveTransition (so CtaBanner/Navbar/Experiences keep working)
- Keeps `PageTransitionProvider` with context-based `navigateTo` (used in App.tsx)

### What stays untouched
App.tsx, HeroSection.tsx, Services.tsx, CtaBanner.tsx, Navbar.tsx, Experiences.tsx — zero changes needed.

### Verification
After changes, clicking Book Now (hero), Explore (services), navbar links, and CTA buttons should all trigger the SVG wave page transition.

