CREATE TABLE public.concierge_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  whatsapp text,
  arrival_date date,
  departure_date date,
  flight_number text,
  guests integer,
  requirements text,
  status text DEFAULT 'new'
);
ALTER TABLE public.concierge_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit enquiries" ON public.concierge_enquiries FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can view enquiries" ON public.concierge_enquiries FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage enquiries" ON public.concierge_enquiries FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());