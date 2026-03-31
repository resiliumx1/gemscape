

## Fix Rentals Page: Visibility, Images, Hero, and Animations

### 1. Fix "SELECTED VEHICLE" label visibility in light mode
**Problem**: The booking form section (`.rb-section`) has a dark navy background, but `gem-form-label` uses `var(--text-tertiary)` which resolves to dark text in light mode — invisible on dark background.
**Fix** in `src/components/RentalBookingForm.tsx`: Override the label color inline or add a scoped CSS rule. Since the booking section always has a dark navy background regardless of theme, the labels should always be light-colored. Add a scoped style block or inline styles forcing labels in `.rb-section` to use white/light colors.

### 2. Fix vehicle card photos — Caribbean-appropriate images
**Problem**: Vehicle cards pull `image_url` from the database. If those are null/empty, they fall back to a generic beach photo. The database vehicle records likely have missing or non-Caribbean images.
**Fix** in `src/pages/Rentals.tsx`: Update the fallback image to a Caribbean vehicle photo. Additionally, update `src/components/RentalsPreview.tsx` homepage preview cards with better Caribbean vehicle images (Jeeps/SUVs on tropical coastal roads with lush green hills and turquoise water).

### 3. Change rentals hero background to uploaded image
**Fix** in `src/pages/Rentals.tsx`: Copy the uploaded image (`user-uploads://image-15.png`) to `src/assets/rentals-hero.png` and import it as the hero background image, replacing the current Unsplash beach URL.

### 4. Animate the "Browse the Fleet" button
**Fix** in `src/index.css`: Add a pulsing glow animation and a shimmer sweep effect to `.rentals-hero__cta`. Make it larger and more prominent with a gold border glow that pulses subtly, plus the signature gem-shimmer sweep on hover.

### 5. Animate hero numbers (How It Works step numbers)
**Fix** in `src/pages/Rentals.tsx`: Add GSAP-powered count-up or fade-in stagger animation to the step numbers (01–04) in the "How It Works" section. Each number will animate in with a scale + opacity entrance triggered by ScrollTrigger when the section enters the viewport.

### Files to modify
1. **`src/components/RentalBookingForm.tsx`** — Add scoped style for `.rb-section .gem-form-label` to force light text
2. **`src/index.css`** — Add `.rb-section .gem-form-label` override, animate `.rentals-hero__cta` with glow/shimmer
3. **`src/pages/Rentals.tsx`** — Import hero image asset, add GSAP animation for step numbers
4. **`src/components/RentalsPreview.tsx`** — Update vehicle image URLs to Caribbean-themed photos
5. **Copy** `user-uploads://image-15.png` → `src/assets/rentals-hero.png`

