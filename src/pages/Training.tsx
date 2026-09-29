import { useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { HorsePicker } from "@/components/breeding/HorsePicker";
import { HorseNameBadge } from "@/components/breeding/HorseNameBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, Plus, Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { MasterKeyDialog } from "@/components/auth/MasterKeyDialog";
import { useLiveRacesList } from "@/hooks/useLiveRaceMatches";
import { buildRaceNumberMap, dedupeRacesLikeLiveEvents, formatRaceLabel, sortRacesCanonically } from "@/utils/raceTimeUtils";

const db = supabase as any;

const Training = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [showKey, setShowKey] = useState(false);
  const [horse, setHorse] = useState<any | null>(null);
  const [raceId, setRaceId] = useState("");
  const [note, setNote] = useState("");
  const [edits, setEdits] = useState<Record<number, string>>({});

  const { data: races } = useLiveRacesList();
  const raceNumbers = useMemo(() => buildRaceNumberMap(races || []), [races]);
  const selectableRaces = useMemo(
    () => sortRacesCanonically(dedupeRacesLikeLiveEvents(races || [])),
    [races]
  );
  const racesById = useMemo(() => new Map((races || []).map((r) => [r.id, r])), [races]);

  const { data: entries } = useQuery({
    queryKey: ["training_focus"],
    queryFn: async () => {
      const { data, error } = await db
        .from("training_focus")
        .select("id, horse_id, race_id, note, created_at, horses(id, name, gender, tier)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const guard = (fn: () => void) => (isAuthenticated ? fn() : setShowKey(true));

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!horse) throw new Error("Choose a horse first");
      if (!raceId) throw new Error("Choose a race first");
      const { error } = await db.from("training_focus").insert({ horse_id: horse.id, race_id: Number(raceId), note });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["training_focus"] });
      setHorse(null);
      setNote("");
      toast({ title: "Added to training" });
    },
    onError: (e: any) => toast({ title: "Could not add", description: e?.message, variant: "destructive" }),
  });

  const noteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: number; note: string }) => {
      const { error } = await db.from("training_focus").update({ note }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["training_focus"] });
      setEdits((p) => { const n = { ...p }; delete n[v.id]; return n; });
      toast({ title: "Note saved" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await db.from("training_focus").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["training_focus"] }),
  });

  // Group entries by race, in the same order/numbering as Live Events
  const groups = useMemo(() => {
    const map = new Map<number, any[]>();
    (entries || []).forEach((e) => {
      if (!map.has(e.race_id)) map.set(e.race_id, []);
      map.get(e.race_id)!.push(e);
    });
    const order = new Map(sortRacesCanonically(races || []).map((r, i) => [r.id, i]));
    return [...map.entries()].sort((a, b) => (order.get(a[0]) ?? 999) - (order.get(b[0]) ?? 999));
  }, [entries, races]);

  const labelFor = (id: number) => {
    const r = racesById.get(id);
    if (!r) return "Unknown race";
    return `${formatRaceLabel(r as any, raceNumbers.get(id) ?? null)} — ${r.race_name}${r.is_active === false ? " (deactivated race)" : ""}`;
  };

  return (
    <Layout>
      <div className="space-y-4 pb-20">
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Dumbbell className="h-5 w-5" /> Training
        </h1>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Add horse to train for a race</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Horse</label>
              {horse ? (
                <div className="flex items-center gap-2">
                  <HorseNameBadge horse={horse} />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setHorse(null)}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <HorsePicker gender="any" label="Horse" onSelect={setHorse} />
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Live race</label>
              <Select value={raceId} onValueChange={setRaceId}>
                <SelectTrigger><SelectValue placeholder="Choose race" /></SelectTrigger>
                <SelectContent className="max-h-80">
                  {selectableRaces.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>{labelFor(r.id)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea placeholder="Notes (optional)" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            <Button
              className={`w-full border-2 ${isAuthenticated ? "border-green-500" : "border-red-500"}`}
              disabled={addMutation.isPending}
              onClick={() => guard(() => addMutation.mutate())}
            >
              <Plus className="h-4 w-4 mr-1" /> Add to training
            </Button>
          </CardContent>
        </Card>

        {groups.length === 0 && <p className="text-sm text-muted-foreground">No horses in training yet.</p>}

        {groups.map(([rid, list]) => (
          <Card key={rid}>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{labelFor(rid)}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {list.map((e) => {
                const draft = edits[e.id];
                return (
                  <div key={e.id} className="border rounded-md p-2 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <HorseNameBadge horse={e.horses} />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => guard(() => deleteMutation.mutate(e.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="Notes"
                      value={draft ?? e.note}
                      onChange={(ev) => setEdits((p) => ({ ...p, [e.id]: ev.target.value }))}
                    />
                    {draft !== undefined && draft !== e.note && (
                      <Button size="sm" onClick={() => guard(() => noteMutation.mutate({ id: e.id, note: draft }))}>Save note</Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
      <MasterKeyDialog isOpen={showKey} onClose={() => setShowKey(false)} onSuccess={() => {}} />
    </Layout>
  );
};

export default Training;
