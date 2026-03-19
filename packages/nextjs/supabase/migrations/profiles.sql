-- 1. Add columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS bio text;

-- 2. Add columns to organizations table
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS description text;
