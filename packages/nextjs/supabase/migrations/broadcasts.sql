-- New table for global system broadcasts
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ -- Optional: auto-hide after this date
);

-- Enable RLS for broadcasts
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

-- Admins (authenticated) can manage all broadcasts
-- Public (or all authenticated) can only see 'sent' broadcasts
CREATE POLICY "Admins can manage broadcasts" ON public.broadcasts
  FOR ALL USING (true); -- We rely on server-side wallet gating for now, but in a real app, use roles.

CREATE POLICY "Everyone can read sent broadcasts" ON public.broadcasts
  FOR SELECT USING (status = 'sent');
