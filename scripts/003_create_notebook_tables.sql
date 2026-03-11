-- NotebookLM tables for LevelCorp

-- Notebooks table (collections of sources)
CREATE TABLE IF NOT EXISTS public.notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Novo Notebook',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sources table (uploaded documents)
CREATE TABLE IF NOT EXISTS public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'pdf', 'txt', 'docx', 'url'
  blob_url TEXT, -- Vercel Blob URL
  blob_pathname TEXT, -- Vercel Blob pathname for private access
  content TEXT, -- Extracted text content
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.notebook_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  citations JSONB, -- Array of source references with quotes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Summaries table
CREATE TABLE IF NOT EXISTS public.notebook_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'executive', 'bullets', 'faq', 'timeline'
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Podcasts table
CREATE TABLE IF NOT EXISTS public.notebook_podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID NOT NULL REFERENCES public.notebooks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  script TEXT, -- The generated conversation script
  audio_url TEXT, -- URL to generated audio (if any)
  duration INTEGER, -- Duration in seconds
  status TEXT DEFAULT 'pending', -- 'pending', 'generating', 'ready', 'error'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON public.notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_sources_notebook_id ON public.sources(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notebook_chats_notebook_id ON public.notebook_chats(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notebook_summaries_notebook_id ON public.notebook_summaries(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notebook_podcasts_notebook_id ON public.notebook_podcasts(notebook_id);

-- Enable RLS
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_podcasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notebooks
CREATE POLICY "notebooks_select_own" ON public.notebooks FOR SELECT USING (true);
CREATE POLICY "notebooks_insert_own" ON public.notebooks FOR INSERT WITH CHECK (true);
CREATE POLICY "notebooks_update_own" ON public.notebooks FOR UPDATE USING (true);
CREATE POLICY "notebooks_delete_own" ON public.notebooks FOR DELETE USING (true);

-- RLS Policies for sources
CREATE POLICY "sources_select" ON public.sources FOR SELECT USING (true);
CREATE POLICY "sources_insert" ON public.sources FOR INSERT WITH CHECK (true);
CREATE POLICY "sources_update" ON public.sources FOR UPDATE USING (true);
CREATE POLICY "sources_delete" ON public.sources FOR DELETE USING (true);

-- RLS Policies for chats
CREATE POLICY "chats_select" ON public.notebook_chats FOR SELECT USING (true);
CREATE POLICY "chats_insert" ON public.notebook_chats FOR INSERT WITH CHECK (true);
CREATE POLICY "chats_delete" ON public.notebook_chats FOR DELETE USING (true);

-- RLS Policies for summaries
CREATE POLICY "summaries_select" ON public.notebook_summaries FOR SELECT USING (true);
CREATE POLICY "summaries_insert" ON public.notebook_summaries FOR INSERT WITH CHECK (true);
CREATE POLICY "summaries_delete" ON public.notebook_summaries FOR DELETE USING (true);

-- RLS Policies for podcasts
CREATE POLICY "podcasts_select" ON public.notebook_podcasts FOR SELECT USING (true);
CREATE POLICY "podcasts_insert" ON public.notebook_podcasts FOR INSERT WITH CHECK (true);
CREATE POLICY "podcasts_update" ON public.notebook_podcasts FOR UPDATE USING (true);
CREATE POLICY "podcasts_delete" ON public.notebook_podcasts FOR DELETE USING (true);
