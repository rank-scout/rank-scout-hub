
-- Create forum_categories table
CREATE TABLE public.forum_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view active forum categories"
ON public.forum_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage forum categories"
ON public.forum_categories FOR ALL
USING (public.has_role(auth.uid(), 'ADMIN'))
WITH CHECK (public.has_role(auth.uid(), 'ADMIN'));

-- Add new columns to forum_threads
ALTER TABLE public.forum_threads
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published',
ADD COLUMN IF NOT EXISTS raw_html_content TEXT;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_forum_threads_status ON public.forum_threads(status);

-- Create storage bucket for forum images
INSERT INTO storage.buckets (id, name, public)
VALUES ('forum-images', 'forum-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for forum images
CREATE POLICY "Anyone can view forum images"
ON storage.objects FOR SELECT
USING (bucket_id = 'forum-images');

CREATE POLICY "Admins can upload forum images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'forum-images' AND public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admins can update forum images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'forum-images' AND public.has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admins can delete forum images"
ON storage.objects FOR DELETE
USING (bucket_id = 'forum-images' AND public.has_role(auth.uid(), 'ADMIN'));
