-- Stop exposing driver_phone through direct table reads.
REVOKE SELECT ON public.trips FROM anon, authenticated;

GRANT SELECT (
  id, route, departure_time, pickup_point, total_seats, available_seats,
  vehicle_name, driver_name, price, status, notes, owner_id, created_at, updated_at
) ON public.trips TO anon, authenticated;

GRANT ALL ON public.trips TO service_role;

-- Admins see every trip's driver phone; approved drivers see only their own.
CREATE OR REPLACE FUNCTION public.get_trip_phones()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_object_agg(t.id::text, t.driver_phone), '{}'::jsonb)
  FROM public.trips t
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
     OR (t.owner_id = auth.uid() AND public.is_approved_driver(auth.uid()));
$$;

REVOKE ALL ON FUNCTION public.get_trip_phones() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_trip_phones() TO authenticated;