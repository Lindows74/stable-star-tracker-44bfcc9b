CREATE TABLE public.breeding_projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.breeding_projects TO anon, authenticated;
GRANT ALL ON public.breeding_projects TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.breeding_projects_id_seq TO anon, authenticated;
GRANT ALL ON SEQUENCE public.breeding_projects_id_seq TO service_role;

ALTER TABLE public.breeding_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view breeding projects" ON public.breeding_projects FOR SELECT USING (true);
CREATE POLICY "Anyone can insert breeding projects" ON public.breeding_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update breeding projects" ON public.breeding_projects FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete breeding projects" ON public.breeding_projects FOR DELETE USING (true);

CREATE TRIGGER update_breeding_projects_updated_at
BEFORE UPDATE ON public.breeding_projects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.breeding_notes
  ADD COLUMN project_id INTEGER REFERENCES public.breeding_projects(id) ON DELETE SET NULL,
  ADD COLUMN outcome TEXT NOT NULL DEFAULT '';

CREATE INDEX idx_breeding_notes_project_id ON public.breeding_notes(project_id);