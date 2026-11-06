import { useState } from 'react';
import { ChevronDown, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HorseNameBadge } from './HorseNameBadge';
import type { HorseAncestry, LineageHorse } from '@/utils/horseLineageUtils';

export function BloodlineBranch({ horse, direction, ancestry, descendants, onChoose, depth = 0, visited = [], role }: {
  horse: LineageHorse;
  direction: 'ancestors' | 'descendants';
  ancestry: HorseAncestry;
  descendants: Record<number, LineageHorse[]>;
  onChoose: (horse: LineageHorse) => void;
  depth?: number;
  visited?: number[];
  role?: string;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const entry = ancestry[horse.id];
  const relations = direction === 'ancestors'
    ? [{ horse: entry?.stallion, role: 'Father' }, { horse: entry?.mare, role: 'Mother' }].filter(r => r.horse != null)
    : (descendants[horse.id] || []).map(child => ({ horse: child, role: child.gender === 'stallion' ? 'Son' : child.gender === 'mare' ? 'Daughter' : 'Foal' }));
  const cycle = visited.includes(horse.id);
  return <li className="space-y-2">
    <div className="flex flex-wrap items-center gap-2 border-b py-2">
      {relations.length > 0 && !cycle && <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label={`${expanded ? 'Collapse' : 'Expand'} ${direction} of ${horse.name}`} onClick={() => setExpanded(!expanded)}>{expanded ? <ChevronDown /> : <ChevronRight />}</Button>}
      {role && <span className="text-xs text-muted-foreground">{role}</span>}
      <HorseNameBadge horse={{ ...horse, gender: horse.gender ?? '' }} />
      {horse.tier != null && <Badge variant="outline">T{horse.tier}</Badge>}
      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 ml-auto" title={`View bloodline of ${horse.name}`} aria-label={`View bloodline of ${horse.name}`} onClick={() => onChoose(horse)}><ArrowUpRight /></Button>
    </div>
    {cycle && <p className="text-xs text-muted-foreground">Already shown in this branch</p>}
    {!cycle && expanded && relations.length > 0 && <ul className="space-y-2 border-l-2 border-border pl-3 sm:pl-5">
      {relations.map(relation => relation.horse && <BloodlineBranch key={`${relation.role}-${relation.horse.id}`} horse={relation.horse} role={relation.role} direction={direction} ancestry={ancestry} descendants={descendants} onChoose={onChoose} depth={depth + 1} visited={[...visited, horse.id]} />)}
    </ul>}
  </li>;
}