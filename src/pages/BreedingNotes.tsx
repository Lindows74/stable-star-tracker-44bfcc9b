import { useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { HorseCard } from "@/components/horses/HorseCard";
import { HorsePicker } from "@/components/breeding/HorsePicker";
import { BreedingProjects } from "@/components/breeding/BreedingProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, Save, Trash2, X } from "lucide-react";
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

  const { data: notes } = useQuery({
    queryKey: ["breeding_notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("breeding_notes")
        .select("*, stallion:stallion_id(id, name), mare:mare_id(id, name)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("breeding_notes").insert({
        stallion_id: stallion?.id ?? null,
        mare_id: mare?.id ?? null,
        title: title.trim(),
        note: note.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["breeding_notes"] });
      setTitle("");
      setNote("");
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
        {/* Pair selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
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
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No mare selected
              </div>
            )}
          </div>
        </div>

        {/* Note editor */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Your thoughts on this pairing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="What are you hoping for from this pairing? Traits, breeds, stats..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
            />
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save note
            </Button>
          </CardContent>
        </Card>

        {/* Unassigned pairings */}
        <div className="space-y-2">
          <h2 className="text-lg md:text-xl font-semibold">Unassigned pairings</h2>
          <p className="text-xs text-muted-foreground">
            Drag a pairing onto a race in the side panel, or pick a race below.
          </p>
          {unassigned.length === 0 && (
            <p className="text-sm text-muted-foreground">No unassigned pairings.</p>
          )}
          {unassigned.map((n: any) => (
            <Card
              key={n.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", String(n.id))}
              className="cursor-grab active:cursor-grabbing"
            >
              <CardContent className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {n.title && <p className="font-semibold break-words">{n.title}</p>}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {n.stallion?.name && <Badge variant="secondary">♂ {n.stallion.name}</Badge>}
                      {n.mare?.name && <Badge variant="secondary">♀ {n.mare.name}</Badge>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete note"
                    onClick={() => deleteMutation.mutate(n.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">{n.note}</p>
                {projects && projects.length > 0 && (
                  <Select
                    onValueChange={(v) => assignPairing.mutate({ id: n.id, projectId: Number(v) })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Move to race..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p: any) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.title || "Untitled race"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(n.updated_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
          </div>

          {/* Side panel: races I'm breeding for */}
          <div className="lg:col-span-1 order-first lg:order-none space-y-2">
            <h2 className="text-lg md:text-xl font-semibold">Races I'm breeding for</h2>
            <BreedingProjects
              projects={(projects as any) || []}
              pairingsByProject={pairingsByProject}
              onCreate={(title, notes) => createProject.mutate({ title, notes })}
              onUpdate={(id, values) => updateProject.mutate({ id, values })}
              onDelete={(id) => deleteProject.mutate(id)}
              onDropPairing={(pairingId, projectId) => assignPairing.mutate({ id: pairingId, projectId })}
              onUpdateOutcome={(id, outcome) => updateOutcome.mutate({ id, outcome })}
              onRemovePairing={(id) => assignPairing.mutate({ id, projectId: null })}
            />
          </div>
        </div>

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
