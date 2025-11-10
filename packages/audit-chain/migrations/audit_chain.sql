-- Migration: Tamper-Evident Audit Log Chain
-- Description: Creates an immutable audit chain using HMAC hashing

CREATE TABLE IF NOT EXISTS public.audit_chain (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_id UUID,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    details JSONB DEFAULT '{}',
    prev_hash TEXT,
    hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_chain_timestamp ON public.audit_chain(timestamp DESC);
CREATE INDEX idx_audit_chain_actor ON public.audit_chain(actor_id);
CREATE INDEX idx_audit_chain_resource ON public.audit_chain(resource);
CREATE INDEX idx_audit_chain_hash ON public.audit_chain(hash);

ALTER TABLE public.audit_chain ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read audit logs"
    ON public.audit_chain FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.get_last_audit_hash()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE last_hash TEXT;
BEGIN
    SELECT hash INTO last_hash FROM public.audit_chain ORDER BY id DESC LIMIT 1;
    RETURN COALESCE(last_hash, '');
END; $$;

CREATE OR REPLACE FUNCTION public.compute_audit_hash(
    p_prev_hash TEXT, p_actor_id UUID, p_action TEXT,
    p_resource TEXT, p_resource_id TEXT, p_details JSONB, p_timestamp TIMESTAMPTZ
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_secret TEXT; v_payload TEXT; v_hash TEXT;
BEGIN
    v_secret := current_setting('app.settings.audit_secret', true);
    IF v_secret IS NULL THEN v_secret := 'default-audit-secret-CHANGE-IN-PRODUCTION'; END IF;
    
    v_payload := p_prev_hash || '|' || COALESCE(p_actor_id::text, 'null') || '|' ||
                p_action || '|' || p_resource || '|' || COALESCE(p_resource_id, 'null') || '|' ||
                COALESCE(p_details::text, '{}') || '|' || p_timestamp::text;
    
    v_hash := encode(hmac(v_payload::bytea, v_secret::bytea, 'sha256'), 'hex');
    RETURN v_hash;
END; $$;

CREATE OR REPLACE FUNCTION public.add_audit_entry(
    p_actor_id UUID, p_action TEXT, p_resource TEXT,
    p_resource_id TEXT DEFAULT NULL, p_details JSONB DEFAULT '{}'
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_id INTEGER;
BEGIN
    INSERT INTO public.audit_chain (actor_id, action, resource, resource_id, details, timestamp)
    VALUES (p_actor_id, p_action, p_resource, p_resource_id, p_details, NOW())
    RETURNING id INTO v_id;
    RETURN v_id;
END; $$;

GRANT SELECT ON public.audit_chain TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_audit_entry TO authenticated;
