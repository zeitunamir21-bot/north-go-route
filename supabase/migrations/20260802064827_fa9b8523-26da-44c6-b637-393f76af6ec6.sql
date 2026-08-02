ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS languages text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS experience_years integer,
  ADD COLUMN IF NOT EXISTS vehicle_color text,
  ADD COLUMN IF NOT EXISTS vehicle_year integer,
  ADD COLUMN IF NOT EXISTS seat_capacity integer NOT NULL DEFAULT 7;

CREATE OR REPLACE FUNCTION public.list_drivers_public()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(jsonb_agg(x ORDER BY x->>'full_name'), '[]'::jsonb)
  FROM (
    SELECT jsonb_build_object(
      'id', d.id,
      'full_name', d.full_name,
      'vehicle_name', d.vehicle_name,
      'plate_number', d.plate_number,
      'photos', d.photos,
      'bio', d.bio,
      'languages', d.languages,
      'experience_years', d.experience_years,
      'vehicle_color', d.vehicle_color,
      'vehicle_year', d.vehicle_year,
      'seat_capacity', d.seat_capacity,
      'member_since', d.created_at,
      'rating_avg', COALESCE((SELECT ROUND(AVG(r.stars)::numeric, 1) FROM public.ratings r WHERE r.driver_id = d.id), 0),
      'rating_count', (SELECT COUNT(*) FROM public.ratings r WHERE r.driver_id = d.id),
      'completed_trips', (SELECT COUNT(*) FROM public.trips t WHERE t.owner_id = d.user_id AND t.departure_time < now()),
      'upcoming_trips', (SELECT COUNT(*) FROM public.trips t WHERE t.owner_id = d.user_id AND t.departure_time >= now() AND t.status = 'scheduled'),
      'status', CASE
        WHEN EXISTS (SELECT 1 FROM public.trips t WHERE t.owner_id = d.user_id AND t.status = 'scheduled' AND t.departure_time BETWEEN now() - interval '6 hours' AND now()) THEN 'on_trip'
        WHEN EXISTS (SELECT 1 FROM public.trips t WHERE t.owner_id = d.user_id AND t.departure_time >= now() AND t.status = 'scheduled') THEN 'available'
        ELSE 'offline'
      END
    ) AS x
    FROM public.drivers d
    WHERE d.status = 'approved'
  ) s;
$$;

REVOKE ALL ON FUNCTION public.list_drivers_public() FROM public;
GRANT EXECUTE ON FUNCTION public.list_drivers_public() TO anon, authenticated;