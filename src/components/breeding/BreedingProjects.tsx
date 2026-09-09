import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Plus, Trash2, Save, X } from "lucide-react";
import { HorsePicker } from "@/components/breeding/HorsePicker";

export type BreedingProject = {
  id: number;
  title: string;
  notes: string;
};

type Props = {
  projects: BreedingProject[];
  pairingsByProject: Record<number, any[]>;
  onCreate: (title: string, notes: string) => void;
  onUpdate: (id: number, values: { title: string; notes: string }) => void;
  onDelete: (id: number) => void;
  onDropPairing: (pairingId: number, projectId: number | null) => void;
  onUpdateOutcome: (pairingId: number, outcome: string) => void;
  onRemovePairing: (pairingId: number) => void;
  onSetFoal: (pairingId: number, foalId: number | null) => void;
};

const PairingRow = ({
  pairing,
  onUpdateOutcome,
  onRemove,
  onSetFoal,
}: {
  pairing: any;
  onUpdateOutcome: (id: number, outcome: string) => void;
  onRemove: (id: number) => void;
  onSetFoal: (id: number, foalId: number | null) => void;
}) => {
  const [outcome, setOutcome] = useState(pairing.outcome || "");
  const dirty = outcome !== (pairing.outcome || "");

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", String(pairing.id))}
      className="rounded-md border bg-background p-2 space-y-2 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {pairing.title && <p className="text-sm font-semibold break-words">{pairing.title}</p>}
          <div className="flex flex-wrap gap-1 mt-1">
            {pairing.stallion?.name && <Badge variant="secondary">♂ {pairing.stallion.name}</Badge>}
            {pairing.mare?.name && <Badge variant="secondary">♀ {pairing.mare.name}</Badge>}
            {pairing.target_tier != null && (
              <Badge className="bg-amber-500 text-white hover:bg-amber-500">Tier {pairing.target_tier}</Badge>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Remove pairing" onClick={() => onRemove(pairing.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {pairing.note && <p className="text-xs whitespace-pre-wrap break-words text-muted-foreground">{pairing.note}</p>}
      <Textarea
        placeholder="Outcome log (foal stats, traits, result...)"
        value={outcome}
        onChange={(e) => setOutcome(e.target.value)}
        rows={2}
        className="text-xs"
      />
      {dirty && (
        <Button size="sm" variant="secondary" onClick={() => onUpdateOutcome(pairing.id, outcome)}>
          <Save className="h-3.5 w-3.5 mr-1" /> Save outcome
        </Button>
      )}

      {/* Foal */}
      {pairing.foal ? (
        <div className="rounded-md border bg-muted/40 p-2 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                🐴 {pairing.foal.name}
              </Badge>
              {pairing.foal.tier != null && <Badge variant="outline">Tier {pairing.foal.tier}</Badge>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label="Remove foal"
              onClick={() => onSetFoal(pairing.id, null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          {pairing.foal.horse_traits?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {pairing.foal.horse_traits.map((t: any, i: number) => (
                <Badge key={i} variant="secondary" className="text-[10px]">
                  {t.trait_name}
                  {t.trait_value ? ` ${t.trait_value}` : ""}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground">No traits registered on this foal.</p>
          )}
        </div>
      ) : (
        <HorsePicker
          gender="any"
          label="Foal"
          size="sm"
          triggerLabel="Add foal"
          onSelect={(h) => onSetFoal(pairing.id, h.id)}
        />
      )}
    </div>
  );
};

export const BreedingProjects = ({
  projects,
  pairingsByProject,
  onCreate,
  onUpdate,
  onDelete,
  onDropPairing,
  onUpdateOutcome,
  onRemovePairing,
  onSetFoal,
}: Props) => {
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [editing, setEditing] = useState<Record<number, { title: string; notes: string }>>({});

  return (
    <aside className="space-y-3">
      <Card>
        <CardContent className="p-3 space-y-2">
          <p className="text-sm font-semibold">New race project</p>
          <Input placeholder="Race / goal" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <Textarea
            placeholder="Notes: distance, surface, traits needed..."
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            rows={2}
          />
          <Button
            size="sm"
            className="w-full"
            disabled={!newTitle.trim()}
            onClick={() => {
              onCreate(newTitle.trim(), newNotes.trim());
              setNewTitle("");
              setNewNotes("");
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add race
          </Button>
        </CardContent>
      </Card>

      {projects.length === 0 && (
        <p className="text-sm text-muted-foreground">No races yet. Add one above.</p>
      )}

      {projects.map((p) => {
        const isOpen = open[p.id] ?? true;
        const list = pairingsByProject[p.id] || [];
        const edit = editing[p.id];
        return (
          <Card
            key={p.id}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(p.id);
            }}
            onDragLeave={() => setDragOver((v) => (v === p.id ? null : v))}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              const id = Number(e.dataTransfer.getData("text/plain"));
              if (id) onDropPairing(id, p.id);
            }}
            className={dragOver === p.id ? "ring-2 ring-primary" : undefined}
          >
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <button
                  className="flex items-center gap-1 text-left min-w-0"
                  onClick={() => setOpen((o) => ({ ...o, [p.id]: !isOpen }))}
                >
                  {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                  <span className="font-semibold break-words">{p.title || "Untitled race"}</span>
                  <Badge variant="outline" className="ml-1">{list.length}</Badge>
                </button>
                <Button variant="ghost" size="icon" aria-label="Delete race" onClick={() => onDelete(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {isOpen && (
                <>
                  <Textarea
                    rows={2}
                    className="text-xs"
                    value={edit ? edit.notes : p.notes}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, [p.id]: { title: p.title, notes: e.target.value } }))
                    }
                    placeholder="Race notes"
                  />
                  {edit && edit.notes !== p.notes && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        onUpdate(p.id, { title: p.title, notes: edit.notes });
                        setEditing((s) => {
                          const n = { ...s };
                          delete n[p.id];
                          return n;
                        });
                      }}
                    >
                      <Save className="h-3.5 w-3.5 mr-1" /> Save notes
                    </Button>
                  )}

                  <div className="space-y-2">
                    {list.length === 0 ? (
                      <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                        Drop a pairing here
                      </p>
                    ) : (
                      list.map((pair) => (
                        <PairingRow
                          key={pair.id}
                          pairing={pair}
                          onUpdateOutcome={onUpdateOutcome}
                          onRemove={onRemovePairing}
                        />
                      ))
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </aside>
  );
};
