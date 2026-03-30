

# Gemscape — Global Fixes, New Pages, and Form Redesigns

This is a large multi-prompt implementation covering phone number fixes, two new pages, and three form redesigns. Here is the execution plan.

---

## Prompt 1: Global Fixes

### 1A. Phone Number Replacement
Replace all placeholder phone numbers across 4 files:
- **`src/components/Footer.tsx`**: `+1 (268) 764-GEMS` → `+1 (268) 780-5510`
- **`src/components/WhatsAppFab.tsx`**: `wa.me/12687644367` → `wa.me/12687805510`
- **`src/components/CtaBanner.tsx`**: `wa.me/12687644367` → `wa.me/12687805510`
- **`src/pages/Concierge.tsx`**: Replace both the WhatsApp link (`wa.me/12687644367`) and the `+1 (268) XXX-XXXX` phone text, make it a clickable `tel:+12687805510` link

### 1B. Create `/contact` Page
New file: **`src/pages/Contact.tsx`**
- Two-column layout (left: contact details cards, right: form)
- Left column: Phone/WhatsApp, Email, Location, WhatsApp CTA button — each in a dark card with gold border
- Right column: Form with Full Name, Email, Phone, Service Interest (select), Message (textarea), Submit button
- On submit: insert into a new `contact_enquiries` database table, then show inline success state
- Dark navy styling consistent with site

### 1C. Create `/experiences` Page
New file: **`src/pages/Experiences.tsx`**
- Page header with eyebrow, heading, subheading
- 3-column grid of experience cards (Island Circumnavigation, Heritage & Discovery, Private Charter)
- Card styling with gold border, hover state transitioning to teal
- CTA buttons link to `/book`

### 1D. Route Registration & Navbar
- **`src/App.tsx`**: Add routes for `/contact` and `/experiences` wrapped in `<PageWrapper>`
- **`src/components/Navbar.tsx`**: Add "CONTACT" nav item to both desktop nav and mobile drawer

### 1E. Database Migration
Create `contact_enquiries` table:
```sql
CREATE TABLE public.contact_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  service_interest text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON public.contact_enquiries
  FOR INSERT WITH CHECK (true);
```

---

## Prompt 2: `/book` Page Redesign

Rebuild **`src/pages/Book.tsx`** and **`src/components/BookingWizard.tsx`** entirely.

### Step Indicator
Horizontal 4-step progress bar (Service → Details → Your Info → Review) with numbered circles, connecting lines, and completion checkmarks.

### Step 1: Service Selection
2x2 grid of service cards with Lucide icons (Anchor, Map, Plane, Sailboat). Each card shows title, description, price tag, and duration badge. Selected state has teal border + glow. "Continue →" button disabled until selection.

### Step 2: Experience Details
Conditional fields based on Step 1 selection:
- **Tours**: Date picker, guest stepper (±), start time select, special requests textarea
- **Flight Concierge**: Arrival date, flight number, airline, passengers stepper, hotel name, special requests
- **Private Charter**: Date, duration select, guests stepper, departure marina select, special requests

Guest stepper: custom `[-] N [+]` component with gold-bordered circular buttons.

### Step 3: Your Info
Two-column layout: Name/Email/Phone (left), Country/Referral source (right). Email consent checkbox required to proceed.

### Step 4: Review & Confirm
Summary card with editable sections, "What Happens Next" checklist, and primary "Send Booking Request →" button. No payment messaging.

### Success State
Animated SVG checkmark, confirmation message, WhatsApp + Home CTAs.

### Form Styling
All inputs: dark translucent background, teal focus ring, uppercase 11px labels, red error states.

Submits to existing `bookings` table (already has all needed columns).

---

## Prompt 3: `/rentals` Booking Form Redesign

Replace **`src/components/RentalBookingForm.tsx`** with a streamlined 2-step inquiry.

### Step 1: Vehicle & Dates Card
Single dark card with gold border containing:
- Vehicle select (pre-populated if user clicked "Book This Vehicle")
- Pickup/Return date pickers side-by-side
- Pickup location select
- Add-on toggle chips (GPS, Child Seat, Extra Driver, Premium Insurance)
- Live pricing summary card

### Step 2: Your Details (reveals on dates selected)
Smooth reveal animation. Three fields in a row: Name, Email, Phone. Plus special requests textarea. Submit button.

The form will still insert into the existing `rental_bookings` table. Since the redesigned form removes `driver_license`, `license_country`, and `dropoff_location` (which are required in the current schema), we need a migration to make those columns nullable:

```sql
ALTER TABLE public.rental_bookings 
  ALTER COLUMN driver_license DROP NOT NULL,
  ALTER COLUMN license_country DROP NOT NULL,
  ALTER COLUMN dropoff_location DROP NOT NULL;
```

### Success State
Checkmark, confirmation heading, WhatsApp button.

---

## Prompt 4: `/concierge` Form Rebuild

Rebuild the enquiry form section of **`src/pages/Concierge.tsx`**.

### Layout
Two-column: left sidebar (40%) with contact info + WhatsApp CTA, right (60%) with the form.

### Left Sidebar
- "We Respond Personally" heading
- Phone + email contact details
- "Chat on WhatsApp →" gold outline button
- Italic confidentiality note

### Right Form
Fields: Name, Email, Phone/WhatsApp, Arrival/Departure dates (side-by-side), Passengers stepper, Services chips (multi-select: Airport Meet & Greet, Private Transfer, Charter Booking, Hotel Booking, Itinerary Planning, Restaurant Reservations), Additional details textarea.

Submits to existing `concierge_enquiries` table (existing columns cover name, email, whatsapp, arrival_date, departure_date, guests, requirements — the selected services chips will be joined into the requirements field).

### Success State
Same pattern: checkmark, heading, WhatsApp button.

---

## Summary of Files

| Action | File |
|--------|------|
| Edit | `src/components/Footer.tsx` (phone) |
| Edit | `src/components/WhatsAppFab.tsx` (WhatsApp URL) |
| Edit | `src/components/CtaBanner.tsx` (WhatsApp URL) |
| Edit | `src/pages/Concierge.tsx` (full form rebuild + phone fix) |
| Edit | `src/App.tsx` (add routes) |
| Edit | `src/components/Navbar.tsx` (add Contact nav item) |
| Edit | `src/pages/Book.tsx` (simplified hero) |
| Rewrite | `src/components/BookingWizard.tsx` (complete redesign) |
| Rewrite | `src/components/RentalBookingForm.tsx` (2-step redesign) |
| Create | `src/pages/Contact.tsx` |
| Create | `src/pages/Experiences.tsx` |
| Migration | Create `contact_enquiries` table |
| Migration | Make `rental_bookings` columns nullable |

