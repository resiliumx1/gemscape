ALTER TABLE public.contact_enquiries
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';