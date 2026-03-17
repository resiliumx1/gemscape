
CREATE TABLE IF NOT EXISTS public.customer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view customer notes" ON public.customer_notes FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert customer notes" ON public.customer_notes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update customer notes" ON public.customer_notes FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete customer notes" ON public.customer_notes FOR DELETE TO public USING (true);

CREATE TABLE IF NOT EXISTS public.customer_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  tag text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(email, tag)
);

ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view customer tags" ON public.customer_tags FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert customer tags" ON public.customer_tags FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can delete customer tags" ON public.customer_tags FOR DELETE TO public USING (true);

CREATE TABLE IF NOT EXISTS public.vehicle_maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  maintenance_date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL DEFAULT 'Service',
  notes text,
  cost numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicle_maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view maintenance" ON public.vehicle_maintenance FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert maintenance" ON public.vehicle_maintenance FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update maintenance" ON public.vehicle_maintenance FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete maintenance" ON public.vehicle_maintenance FOR DELETE TO public USING (true);

CREATE TABLE IF NOT EXISTS public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  recipient_email text NOT NULL,
  recipient_name text,
  email_type text NOT NULL,
  subject text,
  booking_ref text,
  status text NOT NULL DEFAULT 'sent',
  resend_id text
);

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view email log" ON public.email_log FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert email log" ON public.email_log FOR INSERT TO public WITH CHECK (true);
