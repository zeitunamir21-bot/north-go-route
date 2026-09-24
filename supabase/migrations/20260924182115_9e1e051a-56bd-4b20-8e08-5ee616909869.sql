-- Only booking owner, admin, or the trip's driver see full booking phone
CREATE OR REPLACE FUNCTION public.get_booking_details(p_booking_id uuid)
 RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
declare
  v_booking public.bookings%rowtype;
  v_trip public.trips%rowtype;
  v_driver jsonb;
  v_booking_json jsonb;
  v_uid uuid := auth.uid();
  v_privileged boolean;
begin
  select * into v_booking from public.bookings where id = p_booking_id;
  if not found then return null; end if;
  select * into v_trip from public.trips where id = v_booking.trip_id;

  v_privileged := v_uid IS NOT NULL AND (
    v_booking.user_id = v_uid
    OR public.has_role(v_uid, 'admin')
    OR v_trip.owner_id = v_uid
  );

  v_booking_json := to_jsonb(v_booking) - 'user_id';
  if not v_privileged then
    v_booking_json := v_booking_json || jsonb_build_object(
      'phone', CASE WHEN length(v_booking.phone) > 3
                    THEN repeat('•', greatest(length(v_booking.phone) - 3, 1)) || right(v_booking.phone, 3)
                    ELSE '•••' END,
      'customer_name', public.mask_name(v_booking.customer_name)
    );
  end if;

  if v_trip.owner_id is not null then
    select to_jsonb(d) into v_driver from (
      select id, full_name, photos, vehicle_name, plate_number
      from public.drivers where user_id = v_trip.owner_id limit 1
    ) d;
  end if;

  return jsonb_build_object(
    'booking', v_booking_json,
    'trip', to_jsonb(v_trip) - 'driver_phone' - 'owner_id',
    'driver', v_driver
  );
end;
$function$;

-- Sign-in-only functions: not callable by anonymous visitors
REVOKE EXECUTE ON FUNCTION public.admin_list_ratings() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.cancel_booking(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_my_bookings() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_my_rateable_bookings(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_list_ratings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_booking(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_bookings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_rateable_bookings(uuid) TO authenticated;

-- Trigger-only functions: never callable directly
REVOKE EXECUTE ON FUNCTION public.grant_owner_admin() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.sync_driver_role() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;

-- Internal booking helpers: only reachable via reserve_seats_with_promo / the 8-arg wrapper
REVOKE EXECUTE ON FUNCTION public.reserve_seats(uuid, text, text, integer, text, text) FROM anon, authenticated, public;