-- Table for blocking specific wallets or entities
CREATE TABLE IF NOT EXISTS public.blocked_addresses (
  address TEXT PRIMARY KEY,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_by UUID REFERENCES auth.users(id)
);

-- Table for dynamic system-wide settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Default settings
INSERT INTO public.platform_settings (key, value)
VALUES 
  ('maintenance_mode', 'false'::jsonb),
  ('primary_storage', '"arweave"'::jsonb),
  ('max_file_size_mb', '50'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE public.blocked_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage everything
CREATE POLICY "Admins manage everything" ON public.blocked_addresses FOR ALL USING (true);
CREATE POLICY "Admins manage settings" ON public.platform_settings FOR ALL USING (true);

-- Everyone can read settings
CREATE POLICY "Public read settings" ON public.platform_settings FOR SELECT USING (true);
