ALTER TABLE public.ratings ADD COLUMN IF NOT EXISTS booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ratings_booking_id_unique ON public.ratings (booking_id) WHERE booking_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.submit_rating(p_booking_id uuid, p_driver_id uuid, p_trip_id uuid, p_stars integer, p_comment text, p_customer_name text)
 RETURNS ratings
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_booking public.bookings;
  v_trip public.trips;
  v_driver public.drivers;
  v_rating public.ratings;
  v_uid uuid := auth.uid();
BEGIN
  IF p_stars < 1 OR p_stars > 5 THEN
    RAISE EXCEPTION 'Stars must be between 1 and 5';
  END IF;
  IF length(coalesce(p_comment, '')) > 500 THEN
    RAISE EXCEPTION 'Comment too long';
  END IF;
  IF length(trim(coalesce(p_customer_name, ''))) = 0 THEN
    RAISE EXCEPTION 'Customer name required';
  END IF;

  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF v_booking.trip_id <> p_trip_id THEN
    RAISE EXCEPTION 'Booking does not match trip';
  END IF;
  IF v_booking.status = 'cancelled' THEN
    RAISE EXCEPTION 'Cannot rate a cancelled booking';
  END IF;

  IF v_booking.user_id IS NOT NULL AND v_uid IS DISTINCT FROM v_booking.user_id THEN
    RAISE EXCEPTION 'Not your booking';
  END IF;

  IF EXISTS (SELECT 1 FROM public.ratings r WHERE r.booking_id = p_booking_id) THEN
    RAISE EXCEPTION 'You already reviewed this trip';
  END IF;

  SELECT * INTO v_trip FROM public.trips WHERE id = p_trip_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Trip not found'; END IF;

  SELECT * INTO v_driver FROM public.drivers
    WHERE id = p_driver_id AND user_id = v_trip.owner_id AND status = 'approved';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Driver does not match trip';
  END IF;

  INSERT INTO public.ratings (driver_id, trip_id, booking_id, customer_name, stars, comment)
  VALUES (p_driver_id, p_trip_id, p_booking_id, trim(p_customer_name), p_stars, NULLIF(trim(coalesce(p_comment, '')), ''))
  RETURNING * INTO v_rating;

  RETURN v_rating;
END;
$function$;

-- Bookings of the signed-in rider that can still be reviewed for a given driver
CREATE OR REPLACE FUNCTION public.get_my_rateable_bookings(p_driver_id uuid DEFAULT NULL)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN '[]'::jsonb; END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'booking_id', b.id,
      'trip_id', t.id,
      'driver_id', d.id,
      'driver_name', d.full_name,
      'route', t.route,
      'departure_time', t.departure_time,
      'customer_name', b.customer_name
    ) ORDER BY t.departure_time DESC)
    FROM public.bookings b
    JOIN public.trips t ON t.id = b.trip_id
    JOIN public.drivers d ON d.user_id = t.owner_id AND d.status = 'approved'
    WHERE b.user_id = v_uid
      AND b.status <> 'cancelled'
      AND t.departure_time < now()
      AND (p_driver_id IS NULL OR d.id = p_driver_id)
      AND NOT EXISTS (SELECT 1 FROM public.ratings r WHERE r.booking_id = b.id)
  ), '[]'::jsonb);
END;
$function$;

-- Full review list for admins
CREATE OR REPLACE FUNCTION public.admin_list_ratings()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', r.id,
      'stars', r.stars,
      'comment', r.comment,
      'customer_name', r.customer_name,
      'created_at', r.created_at,
      'driver_id', r.driver_id,
      'driver_name', d.full_name,
      'trip_id', r.trip_id,
      'route', t.route,
      'departure_time', t.departure_time
    ) ORDER BY r.created_at DESC)
    FROM public.ratings r
    LEFT JOIN public.drivers d ON d.id = r.driver_id
    LEFT JOIN public.trips t ON t.id = r.trip_id
  ), '[]'::jsonb);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_my_rateable_bookings(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_ratings() TO authenticated;