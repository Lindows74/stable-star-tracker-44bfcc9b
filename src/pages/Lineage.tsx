import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GitBranch, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { HorsePicker } from '@/components/breeding/HorsePicker';
import { HorseNameBadge } from '@/components/breeding/HorseNameBadge';
import { BloodlineBranch } from '@/components/breeding/BloodlineBranch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHorseLineage } from '@/hooks/useHorseLineage';
import { buildHorseDescendants, type LineageHorse } from '@/utils/horseLineageUtils';

export default function Lineage() {
  const [params, setParams] = useSearchParams();
  const { data, isLoading, isError, refetch } = useHorseLineage();
  const selected = data?.horses.find(h => h.id === Number(params.get('horse')));
  const descendants = useMemo(() => buildHorseDescendants(data?.horses || [], data?.ancestry || {}), [data]);
  const choose = (horse: LineageHorse) => setParams({ horse: String(horse.id) });
  const parents = selected ? [
    { horse: data?.ancestry[selected.id]?.stallion, role: 'Father' },
    { horse: data?.ancestry[selected.id]?.mare, role: 'Mother' },
  ] : [];
  const children = selected ? descendants[selected.id] || [] : [];
  return <Layout>
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2"><GitBranch />Lineage</h1>
        <div className="w-full sm:w-72"><HorsePicker gender="any" label="horse" triggerLabel={selected ? 'Change horse' : 'Choose horse'} onSelect={choose} /></div>
      </header>
      {isLoading && <p className="text-muted-foreground">Loading bloodlines…</p>}
      {isError && <div className="flex flex-wrap items-center gap-3"><p>Could not load bloodlines.</p><Button variant="outline" onClick={() => refetch()}><RefreshCw />Retry</Button></div>}
      {!isLoading && !isError && !selected && <div className="border-y py-8 text-muted-foreground">{params.has('horse') ? 'Horse not found.' : 'No horse selected'}</div>}
      {selected && data && <>
        <section aria-label="Ancestors" className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><ArrowUp className="h-4 w-4" />Ancestors</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {parents.map(parent => <ul key={parent.role} className="overflow-hidden">
              {parent.horse ? <BloodlineBranch key={`${selected.id}-${parent.horse.id}`} horse={parent.horse} role={parent.role} direction="ancestors" ancestry={data.ancestry} descendants={descendants} onChoose={choose} visited={[selected.id]} /> : <li className="border-b py-3 text-sm text-muted-foreground">{parent.role} · Not recorded</li>}
            </ul>)}
          </div>
        </section>
        <section aria-label="Selected horse" className="border-y-2 border-primary py-4 flex flex-wrap items-center gap-3">
          <GitBranch className="h-5 w-5 text-muted-foreground" />
          <HorseNameBadge horse={{ ...selected, gender: selected.gender ?? '' }} className="text-base" />
          {selected.tier != null && <Badge variant="outline">Tier {selected.tier}</Badge>}
          <span className="text-sm text-muted-foreground">{children.length} {children.length === 1 ? 'foal' : 'foals'}</span>
        </section>
        <section aria-label="Descendants" className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><ArrowDown className="h-4 w-4" />Descendants</h2>
          {children.length === 0 ? <p className="text-sm text-muted-foreground">No offspring recorded</p> : <ul className="space-y-3 overflow-hidden">
            {children.map(child => <BloodlineBranch key={`${selected.id}-${child.id}`} horse={child} role={child.gender === 'stallion' ? 'Son' : child.gender === 'mare' ? 'Daughter' : 'Foal'} direction="descendants" ancestry={data.ancestry} descendants={descendants} onChoose={choose} visited={[selected.id]} />)}
          </ul>}
        </section>
      </>}
    </div>
  </Layout>;
}