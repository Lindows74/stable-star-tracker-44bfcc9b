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

        {/* Saved notes */}
        <div className="space-y-2">
          <h2 className="text-lg md:text-xl font-semibold">Saved notes</h2>
          {(!notes || notes.length === 0) && (
            <p className="text-sm text-muted-foreground">No saved notes yet.</p>
          )}
          {notes?.map((n: any) => (
            <Card key={n.id}>
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
                <p className="text-xs text-muted-foreground">
                  {new Date(n.updated_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
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
