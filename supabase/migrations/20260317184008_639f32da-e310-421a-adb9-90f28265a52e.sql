
-- ========== ROLE SYSTEM ==========
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Convenience wrapper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- RLS for user_roles: admin only
CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ========== VEHICLES TABLE ==========
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  category text NOT NULL,
  seats integer NOT NULL,
  transmission text NOT NULL,
  fuel_type text NOT NULL,
  luggage_capacity integer,
  ac boolean DEFAULT true,
  daily_rate numeric(10,2) NOT NULL,
  weekly_rate numeric(10,2),
  description text,
  features text[],
  image_url text,
  image_url_2 text,
  image_url_3 text,
  available boolean DEFAULT true,
  sort_order integer DEFAULT 0
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vehicles" ON public.vehicles
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert vehicles" ON public.vehicles
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update vehicles" ON public.vehicles
  FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete vehicles" ON public.vehicles
  FOR DELETE TO authenticated USING (public.is_admin());

-- ========== BOOKING REF GENERATOR ==========
CREATE OR REPLACE FUNCTION public.generate_booking_ref(prefix text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  ref text;
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
BEGIN
  ref := prefix || '-';
  FOR i IN 1..6 LOOP
    ref := ref || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN ref;
END;
$$;

-- ========== BOOKINGS TABLE ==========
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  booking_ref text UNIQUE,
  service_type text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  country text,
  tour_date date NOT NULL,
  party_size integer NOT NULL,
  adults integer,
  children integer,
  pickup_location text,
  flight_details text,
  special_requests text,
  add_ons text[],
  status text DEFAULT 'pending',
  total_estimate numeric(10,2),
  notes text,
  reviewed boolean DEFAULT false,
  review_sent_at timestamptz,
  review_response text
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bookings" ON public.bookings
  FOR SELECT USING (true);
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete bookings" ON public.bookings
  FOR DELETE TO authenticated USING (public.is_admin());

-- Auto-generate booking ref
CREATE OR REPLACE FUNCTION public.set_booking_ref()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.booking_ref IS NULL THEN
    NEW.booking_ref := public.generate_booking_ref('GEM');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_booking_ref
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_booking_ref();

-- ========== RENTAL BOOKINGS TABLE ==========
CREATE TABLE public.rental_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  booking_ref text UNIQUE,
  vehicle_id uuid REFERENCES public.vehicles(id),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  country text,
  pickup_date date NOT NULL,
  return_date date NOT NULL,
  pickup_location text NOT NULL,
  dropoff_location text NOT NULL,
  driver_license text NOT NULL,
  license_country text NOT NULL,
  add_ons text[],
  special_requests text,
  status text DEFAULT 'pending',
  daily_rate numeric(10,2),
  total_days integer,
  total_estimate numeric(10,2),
  notes text,
  reviewed boolean DEFAULT false,
  review_sent_at timestamptz
);
ALTER TABLE public.rental_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rental bookings" ON public.rental_bookings
  FOR SELECT USING (true);
CREATE POLICY "Anyone can create rental bookings" ON public.rental_bookings
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update rental bookings" ON public.rental_bookings
  FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can delete rental bookings" ON public.rental_bookings
  FOR DELETE TO authenticated USING (public.is_admin());

-- Auto-generate rental booking ref
CREATE OR REPLACE FUNCTION public.set_rental_booking_ref()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.booking_ref IS NULL THEN
    NEW.booking_ref := public.generate_booking_ref('RNT');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_rental_booking_ref
  BEFORE INSERT ON public.rental_bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_rental_booking_ref();

-- ========== REVIEW QUEUE ==========
CREATE TABLE public.review_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  booking_id uuid,
  booking_type text,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  service_type text,
  tour_date date,
  scheduled_send timestamptz,
  sent_at timestamptz,
  opened boolean DEFAULT false,
  clicked boolean DEFAULT false,
  review_left boolean DEFAULT false
);
ALTER TABLE public.review_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view review queue" ON public.review_queue
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage review queue" ON public.review_queue
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
-- Allow service_role (edge functions) to insert
CREATE POLICY "Service role can insert review queue" ON public.review_queue
  FOR INSERT WITH CHECK (true);
