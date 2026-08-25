GRANT SELECT, INSERT, UPDATE, DELETE ON public.race_tier_notes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.race_tier_notes TO authenticated;
GRANT ALL ON public.race_tier_notes TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.race_tier_notes_id_seq TO anon, authenticated;