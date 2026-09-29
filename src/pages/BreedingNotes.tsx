import { useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { HorseCard } from "@/components/horses/HorseCard";
import { HorsePicker } from "@/components/breeding/HorsePicker";
import { HorseNameBadge } from "@/components/breeding/HorseNameBadge";
import { BreedingLineageCard, BreedingProjects } from "@/components/breeding/BreedingProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, Heart, Save, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BreedingNotes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [stallion, setStallion] = useState<any | null>(null);
  const [mare, setMare] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [targetTier, setTargetTier] = useState<string>("");

  const { data: notes } = useQuery({
    queryKey: ["breeding_notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("breeding_notes")
        .select(
          `*,
          stallion:stallion_id(
            id, name, gender, tier,
            horse_traits(trait_name, trait_value, trait_category),
            horse_surfaces(surface),
            horse_distances(distance),
            horse_breeding(percentage, breeds(name))
          ),
          mare:mare_id(
            id, name, gender, tier,
            horse_traits(trait_name, trait_value, trait_category),
            horse_surfaces(surface),
            horse_distances(distance),
            horse_breeding(percentage, breeds(name))
          ),
          breeding_note_foals(
            id,
            foal:foal_id(
              id, name, tier, gender,
              horse_traits(trait_name, trait_value, trait_category),
              horse_surfaces(surface),
              horse_distances(distance),
              horse_breeding(percentage, breeds(name))
            )
          )`
        )
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((n: any) => ({
        ...n,
        foals:
          n.breeding_note_foals
            ?.map((bnf: any) => bnf.foal)
            .filter(Boolean) || [],
      }));
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("breeding_notes").insert({
        stallion_id: stallion?.id ?? null,
        mare_id: mare?.id ?? null,
        title: title.trim(),
        note: note.trim(),
        target_tier: targetTier ? Number(targetTier) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["breeding_notes"] });
      setTitle("");
      setNote("");
      setTargetTier("");
      toast({ title: "Saved", description: "Your breeding note was saved." });
    },
    onError: () =>
      toast({ title: "Error", description: "Could not save the note.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("breeding_notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["breeding_notes"] }),
  });

  const { data: projects } = useQuery({
    queryKey: ["breeding_projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("breeding_projects")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["breeding_projects"] });
    queryClient.invalidateQueries({ queryKey: ["breeding_notes"] });
  };

  const createProject = useMutation({
    mutationFn: async ({ title, notes }: { title: string; notes: string }) => {
      const { error } = await supabase.from("breeding_projects").insert({ title, notes });
      if (error) throw error;
    },
    onSuccess: invalidateAll,
    onError: () =>
      toast({ title: "Error", description: "Could not add the race.", variant: "destructive" }),
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: { title: string; notes: string } }) => {
      const { error } = await supabase.from("breeding_projects").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const archiveProject = useMutation({
    mutationFn: async ({ id, archived }: { id: number; archived: boolean }) => {
      const { error } = await supabase.from("breeding_projects").update({ is_archived: archived } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => { invalidateAll(); toast({ title: v.archived ? "Project archived" : "Project restored" }); },
    onError: () => toast({ title: "Error", description: "Could not archive the project.", variant: "destructive" }),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("breeding_projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const assignPairing = useMutation({
    mutationFn: async ({ id, projectId }: { id: number; projectId: number | null }) => {
      const { error } = await supabase
        .from("breeding_notes")
        .update({ project_id: projectId })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidateAll,
  });

  const updateOutcome = useMutation({
    mutationFn: async ({ id, outcome }: { id: number; outcome: string }) => {
      const { error } = await supabase.from("breeding_notes").update({ outcome }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Saved", description: "Outcome log updated." });
    },
  });

  const addFoal = useMutation({
    mutationFn: async ({ id, foalId }: { id: number; foalId: number }) => {
      const { error } = await (supabase.from("breeding_note_foals") as any).insert({
        breeding_note_id: id,
        foal_id: foalId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Saved", description: "Foal added." });
    },
    onError: () =>
      toast({ title: "Error", description: "Could not save the foal.", variant: "destructive" }),
  });

  const removeFoal = useMutation({
    mutationFn: async ({ noteId, foalId }: { noteId: number; foalId: number }) => {
      const { error } = await (supabase.from("breeding_note_foals") as any)
        .delete()
        .eq("breeding_note_id", noteId)
        .eq("foal_id", foalId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAll();
      toast({ title: "Removed", description: "Foal removed from pairing." });
    },
    onError: () =>
      toast({ title: "Error", description: "Could not remove the foal.", variant: "destructive" }),
  });

  const setTries = useMutation({
    mutationFn: async ({ id, tries }: { id: number; tries: number }) => {
      const { error } = await (supabase.from("breeding_notes") as any)
        .update({ tries })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidateAll,
    onError: () =>
      toast({ title: "Error", description: "Could not save the tries counter.", variant: "destructive" }),
  });

  const pairingsByProject = useMemo(() => {
    const map: Record<number, any[]> = {};
    (notes || []).forEach((n: any) => {
      if (n.project_id) {
        map[n.project_id] = map[n.project_id] || [];
        map[n.project_id].push(n);
      }
    });
    return map;
  }, [notes]);

  const unassigned = useMemo(
    () => (notes || []).filter((n: any) => !n.project_id),
    [notes]
  );

  // horseId -> the pairing that produced this horse, so lineages can be traced
  // through foals that were later used as parents in new pairings.
  const ancestry = useMemo(() => {
    const map: Record<number, any> = {};
    (notes || []).forEach((n: any) => {
      (n.foals || []).forEach((foal: any) => {
        if (foal?.id != null) map[foal.id] = { stallion: n.stallion, mare: n.mare, title: n.title };
      });
    });
    return map;
  }, [notes]);

  const handleSave = () => {
    if (!note.trim()) {
      toast({ title: "Nothing to save", description: "Write a note first.", variant: "destructive" });
      return;
    }
    saveMutation.mutate();
  };

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Breeding</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Pick a stallion and a mare, compare them side by side and save your breeding thoughts.
          </p>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Active pairing</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(18rem,0.8fr)] lg:items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HorsePicker
                gender="stallion"
                label="Stallion"
                triggerLabel={stallion ? `Stallion: ${stallion.name}` : undefined}
                onSelect={setStallion}
              />
              {stallion && (
                <Button variant="ghost" size="icon" aria-label="Clear stallion" onClick={() => setStallion(null)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {stallion ? (
              <HorseCard horse={stallion} />
            ) : (
              <div className="rounded-lg border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
                No stallion selected
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HorsePicker
                gender="mare"
                label="Mare"
                triggerLabel={mare ? `Mare: ${mare.name}` : undefined}
                onSelect={setMare}
              />
              {mare && (
                <Button variant="ghost" size="icon" aria-label="Clear mare" onClick={() => setMare(null)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {mare ? (
              <HorseCard horse={mare} />
            ) : (
              <div className="rounded-lg border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
                No mare selected
              </div>
            )}
          </div>
          <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold">Breeding goal</p>
            <Input
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="w-full sm:w-48">
              <Select value={targetTier} onValueChange={setTargetTier}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Wanted foal tier" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => (
                    <SelectItem key={t} value={String(t)}>
                      Tier {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="What are you hoping for from this pairing? Traits, breeds, stats..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save note
            </Button>
          </CardContent>
          </Card>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg md:text-xl font-semibold">Unassigned pairings</h2>
              <p className="text-xs text-muted-foreground">Move a pairing to a breeding project when ready.</p>
            </div>
            <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">{unassigned.length}</span>
          </div>
          {unassigned.length === 0 && (
            <p className="text-sm text-muted-foreground">No unassigned pairings.</p>
          )}
          <div className="space-y-3">
            {unassigned.map((n: any) => (
              <BreedingLineageCard
                key={n.id}
                pairing={n}
                onUpdateOutcome={(id, outcome) => updateOutcome.mutate({ id, outcome })}
                onRemove={(id) => deleteMutation.mutate(id)}
                onAddFoal={(id, foalId) => addFoal.mutate({ id, foalId })}
                onRemoveFoal={(id, foalId) => removeFoal.mutate({ noteId: id, foalId })}
                 onSetTries={(id, tries) => setTries.mutate({ id, tries })}
                 ancestry={ancestry}
                footer={projects && projects.length > 0 ? (
                  <Select onValueChange={(v) => assignPairing.mutate({ id: n.id, projectId: Number(v) })}>
                    <SelectTrigger className="h-9 w-full sm:w-64"><SelectValue placeholder="Move to race..." /></SelectTrigger>
                    <SelectContent>{projects.map((p: any) => <SelectItem key={p.id} value={String(p.id)}>{p.title || "Untitled race"}</SelectItem>)}</SelectContent>
                  </Select>
                ) : undefined}
              />
            ))}
          </div>
        </section>

        <BreedingProjects
              projects={(projects as any) || []}
              pairingsByProject={pairingsByProject}
              onCreate={(title, notes) => createProject.mutate({ title, notes })}
              onUpdate={(id, values) => updateProject.mutate({ id, values })}
              onDelete={(id) => deleteProject.mutate(id)}
              onArchive={(id, archived) => archiveProject.mutate({ id, archived })}
              onDropPairing={(pairingId, projectId) => assignPairing.mutate({ id: pairingId, projectId })}
              onUpdateOutcome={(id, outcome) => updateOutcome.mutate({ id, outcome })}
              onRemovePairing={(id) => assignPairing.mutate({ id, projectId: null })}
              onAddFoal={(id, foalId) => addFoal.mutate({ id, foalId })}
              onRemoveFoal={(id, foalId) => removeFoal.mutate({ noteId: id, foalId })}
               onSetTries={(id, tries) => setTries.mutate({ id, tries })}
               ancestry={ancestry}
        />

        <Button
          variant="default"
          size="icon"
          className="fixed bottom-20 right-4 z-50 rounded-full shadow-xl"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>
    </Layout>
  );
};

export default BreedingNotes;
