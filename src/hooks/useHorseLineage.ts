import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { buildHorseAncestry, type LineageHorse, type LineageNote } from '@/utils/horseLineageUtils';

export function useHorseLineage() {
  return useQuery({
    queryKey: ['breeding_notes', 'lineage'],
    queryFn: async () => {
      const horses: LineageHorse[] = [];
      const notes: LineageNote[] = [];
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await supabase.from('horses').select('id, name, gender, tier, sire_id, dam_id').order('id').range(offset, offset + 999);
        if (error) throw error;
        horses.push(...data);
        if (data.length < 1000) break;
      }
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await supabase.from('breeding_notes').select('stallion_id, mare_id, foal_id, title, breeding_note_foals(foal_id)').order('updated_at', { ascending: false }).order('id', { ascending: false }).range(offset, offset + 999);
        if (error) throw error;
        notes.push(...data);
        if (data.length < 1000) break;
      }
      return { horses, ancestry: buildHorseAncestry(horses, notes) };
    },
  });
}