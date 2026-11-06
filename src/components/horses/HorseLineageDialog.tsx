import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HorsePicker } from '@/components/breeding/HorsePicker';
import { HorseNameBadge } from '@/components/breeding/HorseNameBadge';
import { MasterKeyDialog } from '@/components/auth/MasterKeyDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateHorseParents, type HorseAncestry, type LineageHorse } from '@/utils/horseLineageUtils';

export function HorseLineageDialog({ horse, ancestry, onClose }: { horse: LineageHorse; ancestry: HorseAncestry; onClose: () => void }) {
  const [sire, setSire] = useState<LineageHorse | null>(ancestry[horse.id]?.stallion ?? null);
  const [dam, setDam] = useState<LineageHorse | null>(ancestry[horse.id]?.mare ?? null);
  const [unlock, setUnlock] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const validation = validateHorseParents(horse.id, sire, dam, ancestry);
      if (validation) throw new Error(validation);
      const { error } = await supabase.from('horses').update({ sire_id: sire?.id ?? null, dam_id: dam?.id ?? null }).eq('id', horse.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['horses'] }),
        client.invalidateQueries({ queryKey: ['horse', horse.id] }),
        client.invalidateQueries({ queryKey: ['breeding_notes'] }),
      ]);
      toast({ title: 'Lineage saved' });
      onClose();
    },
    onError: (error: Error) => toast({ title: 'Could not save lineage', description: error.message, variant: 'destructive' }),
  });
  const inherited = ancestry[horse.id];
  return <Dialog open onOpenChange={open => { if (!open && !mutation.isPending) onClose(); }}>
    <DialogContent>
      <DialogHeader><DialogTitle>Lineage · {horse.name}</DialogTitle></DialogHeader>
      <div className="grid gap-4 sm:grid-cols-2">
        {([{ role: 'Father', label: 'father (stallion)', gender: 'stallion', value: sire, set: setSire, fallback: inherited?.stallion },
          { role: 'Mother', label: 'mother (mare)', gender: 'mare', value: dam, set: setDam, fallback: inherited?.mare }] as const).map(parent => <section key={parent.role} className="space-y-2 overflow-hidden">
            <h3 className="text-sm font-semibold">{parent.role}</h3>
            <div className="flex items-center justify-between gap-2">
              {parent.value ? <HorseNameBadge horse={parent.value} /> : <span className="text-sm text-muted-foreground">Not recorded</span>}
              {parent.value && <Button variant="ghost" size="icon" title={`Clear ${parent.role.toLowerCase()}`} aria-label={`Clear ${parent.role.toLowerCase()}`} onClick={() => parent.set(null)}><X /></Button>}
            </div>
            <HorsePicker gender={parent.gender} label={parent.label} excludeHorseIds={[horse.id]} onSelect={parent.set} />
          </section>)}
      </div>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
        <Button className={`border-4 ${isAuthenticated ? 'border-[hsl(var(--access-unlocked))]' : 'border-destructive'}`} onClick={() => isAuthenticated ? mutation.mutate() : setUnlock(true)} disabled={mutation.isPending}><Save />{mutation.isPending ? 'Saving…' : 'Save lineage'}</Button>
      </DialogFooter>
      <MasterKeyDialog isOpen={unlock} onClose={() => setUnlock(false)} onSuccess={() => mutation.mutate()} />
    </DialogContent>
  </Dialog>;
}