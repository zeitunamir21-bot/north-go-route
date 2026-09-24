DO $$ BEGIN
  EXECUTE replace(pg_get_functiondef('public.get_booking_details(uuid)'::regprocedure),
    $r$to_jsonb(v_trip) - 'driver_phone' - 'owner_id'$r$, $r$to_jsonb(v_trip) - 'owner_id'$r$);
END $$;