ALTER TABLE public.horses ADD COLUMN IF NOT EXISTS sire_id integer REFERENCES public.horses(id) ON DELETE SET NULL, ADD COLUMN IF NOT EXISTS dam_id integer REFERENCES public.horses(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS horses_sire_id_idx ON public.horses(sire_id);
CREATE INDEX IF NOT EXISTS horses_dam_id_idx ON public.horses(dam_id);