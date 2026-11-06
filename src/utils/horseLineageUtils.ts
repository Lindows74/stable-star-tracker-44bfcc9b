export type LineageHorse = { id: number; name: string; gender: string | null; tier?: number | null; sire_id?: number | null; dam_id?: number | null };
export type LineageNote = { stallion_id: number | null; mare_id: number | null; foal_id?: number | null; title?: string; breeding_note_foals?: { foal_id: number }[] };
export type HorseAncestry = Record<number, { stallion?: LineageHorse; mare?: LineageHorse; title?: string }>;

export function buildHorseDescendants(horses: LineageHorse[], ancestry: HorseAncestry): Record<number, LineageHorse[]> {
  const children: Record<number, LineageHorse[]> = {};
  for (const horse of horses) {
    const parents = new Set([ancestry[horse.id]?.stallion?.id, ancestry[horse.id]?.mare?.id]);
    for (const parentId of parents) {
      if (parentId == null || parentId === horse.id) continue;
      (children[parentId] ??= []).push(horse);
    }
  }
  for (const list of Object.values(children)) list.sort((a, b) => a.name.localeCompare(b.name));
  return children;
}

export function buildHorseAncestry(horses: LineageHorse[], notes: LineageNote[]): HorseAncestry {
  const byId = new Map(horses.map(h => [h.id, h]));
  const map: HorseAncestry = {};
  // Newest breeding record wins. Archived projects remain included.
  for (const note of notes) {
    const foals = [...(note.breeding_note_foals || []).map(f => f.foal_id), ...(note.foal_id == null ? [] : [note.foal_id])];
    for (const id of foals) {
      if (!map[id]) map[id] = { stallion: byId.get(note.stallion_id ?? -1), mare: byId.get(note.mare_id ?? -1), title: note.title };
    }
  }
  for (const horse of horses) {
    if (horse.sire_id != null || horse.dam_id != null) {
      map[horse.id] = { ...map[horse.id],
        stallion: byId.get(horse.sire_id ?? -1) ?? map[horse.id]?.stallion,
        mare: byId.get(horse.dam_id ?? -1) ?? map[horse.id]?.mare,
      };
    }
  }
  return map;
}

export function validateHorseParents(horseId: number, sire: LineageHorse | null, dam: LineageHorse | null, ancestry: HorseAncestry): string | null {
  if (sire && sire.gender !== 'stallion') return 'Choose a stallion as the father.';
  if (dam && dam.gender !== 'mare') return 'Choose a mare as the mother.';
  const reachesHorse = (id: number, visited = new Set<number>()): boolean => {
    if (id === horseId) return true;
    if (visited.has(id)) return false;
    visited.add(id);
    const entry = ancestry[id];
    return [entry?.stallion, entry?.mare].some(p => p != null && reachesHorse(p.id, visited));
  };
  if ([sire, dam].some(p => p != null && reachesHorse(p.id))) return 'A horse cannot be its own ancestor. Choose another parent.';
  return null;
}