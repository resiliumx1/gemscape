CREATE TABLE public.itinerary_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  destination text,
  travel_dates text,
  travelers integer,
  experience_type text,
  services_needed text[],
  budget_range text,
  message text,
  status text NOT NULL DEFAULT 'new'
);

ALTER TABLE public.itinerary_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit itinerary requests"
  ON public.itinerary_requests FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view itinerary requests"
  ON public.itinerary_requests FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update itinerary requests"
  ON public.itinerary_requests FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete itinerary requests"
  ON public.itinerary_requests FOR DELETE
  TO authenticated
  USING (public.is_admin());