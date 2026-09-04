GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_races TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_races TO authenticated;
GRANT ALL ON public.live_races TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.live_races_id_seq TO anon, authenticated;

CREATE POLICY "Anyone can insert live races" ON public.live_races FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update live races" ON public.live_races FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete live races" ON public.live_races FOR DELETE USING (true);