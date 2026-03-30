
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
  FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can view contact enquiries" ON public.contact_enquiries
  FOR SELECT TO authenticated USING (public.is_admin());

ALTER TABLE public.rental_bookings 
  ALTER COLUMN driver_license DROP NOT NULL,
  ALTER COLUMN license_country DROP NOT NULL,
  ALTER COLUMN dropoff_location DROP NOT NULL;
