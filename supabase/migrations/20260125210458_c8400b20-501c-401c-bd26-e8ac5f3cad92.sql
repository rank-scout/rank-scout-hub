-- Forum Threads Tabelle
CREATE TABLE public.forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Forum Replies Tabelle
CREATE TABLE public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes für Performance
CREATE INDEX idx_forum_threads_slug ON public.forum_threads(slug);
CREATE INDEX idx_forum_threads_created ON public.forum_threads(created_at DESC);
CREATE INDEX idx_forum_replies_thread ON public.forum_replies(thread_id);

-- RLS aktivieren
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public Read
CREATE POLICY "Anyone can view active threads" ON public.forum_threads
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view active replies" ON public.forum_replies
  FOR SELECT USING (is_active = true);

-- RLS Policies: Public Insert
CREATE POLICY "Anyone can create threads" ON public.forum_threads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can create replies" ON public.forum_replies
  FOR INSERT WITH CHECK (true);

-- Admin-Policies
CREATE POLICY "Admins manage threads" ON public.forum_threads
  FOR ALL USING (has_role(auth.uid(), 'ADMIN'));

CREATE POLICY "Admins manage replies" ON public.forum_replies
  FOR ALL USING (has_role(auth.uid(), 'ADMIN'));

-- Trigger für updated_at
CREATE TRIGGER update_forum_threads_updated_at
  BEFORE UPDATE ON public.forum_threads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();