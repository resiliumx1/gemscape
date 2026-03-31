

## Fix Multiple Issues Across Homepage, Rentals, and Booking Pages

### 1. WhyGemscape light mode visibility
**Problem**: All text colors are hardcoded to `#fff` and `rgba(255,255,255,...)` — invisible on light mode's white background.
**Fix** in `src/components/WhyGemscape.tsx`: Replace all hardcoded white colors with CSS variable references (`var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`). Same for pillar card backgrounds — use `var(--card-bg)` and `var(--border-color)`.

### 2. Rentals page dark mode visibility
**Problem**: Fleet grid (`.rentals-fleet`) uses `hsl(var(--gem-cream))` background, vehicle cards use `hsl(var(--gem-white))`, and all text uses `hsl(var(--gem-navy))` — all light-only colors with no `.dark` overrides. Inclusions banner has the same issue with `hsl(var(--gem-sand))`.
**Fix** in `src/index.css`: Add `.dark` overrides for:
- `.rentals-fleet` — dark background
- `.r-card` — dark card background
- `.r-card__name`, `.r-card__price`, `.r-card__from`, `.r-card__per`, `.r-card__spec` — light text
- `.r-card__divider` — subtle border
- `.r-card__book-link` — teal on dark
- `.rentals-inclusions` — dark background
- `.rentals-inclusions__title`, `.rentals-inclusions__desc` — light text
- `.rentals-how` already uses gem-navy so it's fine in dark

### 3. Vehicle card images — Antigua-appropriate vehicles with island backdrops
**Problem**: `RentalsPreview.tsx` uses generic Unsplash car photos that don't match Caribbean setting.
**Fix** in `src/components/RentalsPreview.tsx`: Replace all 3 vehicle image URLs with Unsplash photos of SUVs/Jeeps with tropical/coastal backgrounds. Every card already has a photo — just swap URLs to more appropriate ones (e.g., Jeep on beach, SUV on coastal road, sedan in tropical setting).

### 4. "Browse the Fleet" button on homepage
**Problem**: The button navigates to `/rentals` page root. It should scroll to the fleet grid.
**Fix** in `src/components/RentalsPreview.tsx`: Change `navigateTo("/rentals")` to `navigateTo("/rentals#fleet")` for the "Browse the Fleet" button.

### 5. Country of residence dropdown — full country list, scrollable
**Problem**: `BookingWizard.tsx` has only 15 countries in the `COUNTRIES` array. Uses a native `<select>` which is scrollable but limited.
**Fix** in `src/components/BookingWizard.tsx`: Replace the short `COUNTRIES` array with a comprehensive list of ~195 countries (all UN member states), alphabetically sorted. The native `<select>` element is already scrollable by default, so no component change needed — just expand the data.

### 6. Currency toggle should update all prices
The currency system already works — `useCurrency` hook is used in `RentalsPreview.tsx`, `Rentals.tsx`, `RentalBookingForm.tsx`, and `BookingWizard.tsx`. However, the BookingWizard service cards display hardcoded price strings like `"From $280 per group"` instead of using `formatPrice()`.
**Fix** in `src/components/BookingWizard.tsx`: Replace the hardcoded `price` strings in the SERVICES array rendering with dynamic `formatPrice(svc.basePrice)` calls so they respond to the currency toggle.

### Files to modify
1. **`src/components/WhyGemscape.tsx`** — Replace hardcoded white colors with theme variables
2. **`src/index.css`** — Add `.dark` overrides for rental fleet grid, vehicle cards, and inclusions banner
3. **`src/components/RentalsPreview.tsx`** — Swap vehicle images to tropical/Caribbean Unsplash photos; change Browse Fleet to `/rentals#fleet`
4. **`src/components/BookingWizard.tsx`** — Expand COUNTRIES to full list; use `formatPrice()` for service card prices

