CREATE TABLE public.breeding_notes (
  id SERIAL PRIMARY KEY,
  stallion_id INTEGER REFERENCES public.horses(id) ON DELETE CASCADE,
  mare_id INTEGER REFERENCES public.horses(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.breeding_notes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.breeding_notes TO authenticated;
GRANT ALL ON public.breeding_notes TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.breeding_notes_id_seq TO anon, authenticated;

ALTER TABLE public.breeding_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view breeding notes" ON public.breeding_notes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert breeding notes" ON public.breeding_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update breeding notes" ON public.breeding_notes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete breeding notes" ON public.breeding_notes FOR DELETE USING (true);

CREATE TRIGGER update_breeding_notes_updated_at
BEFORE UPDATE ON public.breeding_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();