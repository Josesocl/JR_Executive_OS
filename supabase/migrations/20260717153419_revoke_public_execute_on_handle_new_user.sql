-- handle_new_user only needs to run via its auth.users trigger (as trigger owner),
-- not be publicly callable through the exposed PostgREST RPC endpoint.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
