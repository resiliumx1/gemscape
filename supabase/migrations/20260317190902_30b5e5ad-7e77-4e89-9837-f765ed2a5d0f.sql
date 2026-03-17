
-- Site settings table (single row)
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_email text DEFAULT '',
  whatsapp_number text DEFAULT '',
  business_name text DEFAULT 'Gemscape Travel & Tours',
  review_delay_hours integer DEFAULT 24,
  review_reminder_enabled boolean DEFAULT false,
  review_platforms jsonb DEFAULT '{"google": {"enabled": true, "url": ""}, "tripadvisor": {"enabled": true, "url": ""}, "facebook": {"enabled": false, "url": ""}}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- Seed default row
INSERT INTO public.site_settings (owner_email, whatsapp_number) VALUES ('', '');
