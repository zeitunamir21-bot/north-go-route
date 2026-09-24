REVOKE EXECUTE ON FUNCTION public.is_approved_driver(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_approved_driver(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.reserve_seats(uuid, text, text, integer, text, text, integer[]) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.reserve_seats(uuid, text, text, integer, text, text, integer[], uuid) FROM anon, authenticated, public;