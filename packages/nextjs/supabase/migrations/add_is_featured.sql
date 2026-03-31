-- Add is_featured column to the evidence table
ALTER TABLE public.evidence ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Create an index for faster sorting by featured status
CREATE INDEX IF NOT EXISTS idx_evidence_is_featured ON public.evidence(is_featured);

-- Update the schema comment for the evidence table
COMMENT ON COLUMN public.evidence.is_featured IS 'Whether this evidence is marked as crucial/featured and should appear at the top.';
