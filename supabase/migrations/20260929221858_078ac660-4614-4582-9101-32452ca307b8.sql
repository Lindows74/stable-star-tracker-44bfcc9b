CREATE TABLE public.training_focus (
  id serial PRIMARY KEY,
  horse_id integer NOT NULL REFERENCES public.horses(id) ON DELETE CASCADE,
  race_id integer NOT NULL REFERENCES public.live_races(id) ON DELETE CASCADE,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_focus TO anon, authenticated;
GRANT ALL ON public.training_focus TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.training_focus_id_seq TO anon, authenticated;
ALTER TABLE public.training_focus ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage training focus" ON public.training_focus FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_training_focus_updated_at BEFORE UPDATE ON public.training_focus FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();