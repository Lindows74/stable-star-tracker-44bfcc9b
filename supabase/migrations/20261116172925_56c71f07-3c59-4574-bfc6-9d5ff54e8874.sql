SELECT setval('public.race_results_id_seq', (SELECT COALESCE(MAX(id),0) FROM public.race_results) + 1, false);
GRANT USAGE, SELECT ON SEQUENCE public.race_results_id_seq TO anon, authenticated;