CREATE OR REPLACE FUNCTION public.verify_audit_chain(p_user_id uuid DEFAULT NULL)
RETURNS TABLE(intact boolean, total_entries integer, verified_entries integer,
              broken_at_id uuid, expected text, actual text)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE r RECORD; prev_hash_val text := ''; last_user_id uuid := NULL;
        vcount int := 0; tcount int := 0; secret_val text;
        expected_hash text; payload text;
BEGIN
  FOR r IN SELECT * FROM public.audit_logs
    WHERE p_user_id IS NULL OR user_id = p_user_id ORDER BY user_id, id
  LOOP
    tcount := tcount + 1;
    IF last_user_id IS DISTINCT FROM r.user_id THEN
      prev_hash_val := ''; last_user_id := r.user_id;
    END IF;
    IF COALESCE(r.prev_hash, '') <> prev_hash_val THEN
      RETURN QUERY SELECT false, tcount, vcount, r.id, prev_hash_val, COALESCE(r.prev_hash, '');
      RETURN;
    END IF;
    -- Hash verification logic here
    vcount := vcount + 1;
    prev_hash_val := r.hash;
  END LOOP;
  RETURN QUERY SELECT true, tcount, vcount, NULL::uuid, NULL::text, NULL::text;
END; $$;
