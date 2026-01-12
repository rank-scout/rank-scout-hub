-- Add target_domain field to categories table
ALTER TABLE public.categories 
ADD COLUMN target_domain text NOT NULL DEFAULT 'dating.rank-scout.com';

-- Add an index for faster domain-based filtering
CREATE INDEX idx_categories_target_domain ON public.categories(target_domain);

-- Create a domains table for managing available domains
CREATE TABLE public.domains (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain text NOT NULL UNIQUE,
  display_name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Anyone can view active domains
CREATE POLICY "Anyone can view active domains" 
ON public.domains 
FOR SELECT 
USING (is_active = true);

-- Admins can manage domains
CREATE POLICY "Admins can manage domains" 
ON public.domains 
FOR ALL 
USING (has_role(auth.uid(), 'ADMIN'::user_role))
WITH CHECK (has_role(auth.uid(), 'ADMIN'::user_role));

-- Insert default domains
INSERT INTO public.domains (domain, display_name, is_default, sort_order) VALUES
  ('dating.rank-scout.com', 'Dating (dating.rank-scout.com)', true, 0),
  ('rank-scout.com', 'Hauptseite (rank-scout.com)', false, 1);