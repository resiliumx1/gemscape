
-- Fix function search_path warnings
ALTER FUNCTION public.generate_booking_ref(text) SET search_path = public;
ALTER FUNCTION public.set_booking_ref() SET search_path = public;
ALTER FUNCTION public.set_rental_booking_ref() SET search_path = public;
