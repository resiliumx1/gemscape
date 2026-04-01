
CREATE TABLE IF NOT EXISTS public.package_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_ref TEXT DEFAULT public.generate_booking_ref('PKG') UNIQUE,
  package_type TEXT NOT NULL CHECK (package_type IN ('explorer', 'experience', 'elite')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  travel_dates TEXT,
  party_size INTEGER DEFAULT 2,
  experience_interests TEXT[],
  special_requests TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  total_price NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.package_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON public.package_bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated reads" ON public.package_bookings
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated updates" ON public.package_bookings
  FOR UPDATE USING (true);
