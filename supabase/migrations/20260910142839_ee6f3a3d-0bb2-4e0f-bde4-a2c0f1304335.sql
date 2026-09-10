CREATE SEQUENCE IF NOT EXISTS public.breeding_note_foals_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

CREATE TABLE public.breeding_note_foals (
  id integer NOT NULL DEFAULT nextval('public.breeding_note_foals_id_seq'::regclass) PRIMARY KEY,
  breeding_note_id integer NOT NULL REFERENCES public.breeding_notes(id) ON DELETE CASCADE,
  foal_id integer NOT NULL REFERENCES public.horses(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (breeding_note_id, foal_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.breeding_note_foals TO authenticated;
GRANT ALL ON public.breeding_note_foals TO service_role;

ALTER TABLE public.breeding_note_foals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage breeding note foals"
ON public.breeding_note_foals
FOR ALL
TO public
USING (true)
WITH CHECK (true);

CREATE INDEX idx_breeding_note_foals_note ON public.breeding_note_foals(breeding_note_id);

CREATE TRIGGER update_breeding_note_foals_updated_at
BEFORE UPDATE ON public.breeding_note_foals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();