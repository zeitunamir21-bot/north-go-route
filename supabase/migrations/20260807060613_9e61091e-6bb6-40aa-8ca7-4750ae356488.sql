DROP POLICY IF EXISTS "Public can view ratings" ON public.ratings;
REVOKE SELECT ON public.ratings FROM anon;
REVOKE ALL ON public.ratings FROM anon;
GRANT SELECT ON public.ratings TO authenticated;
GRANT ALL ON public.ratings TO service_role;