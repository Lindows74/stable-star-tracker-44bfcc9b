import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, GitBranch, Plus, Minus, Trash2, Save, X, Pencil } from "lucide-react";
import { HorseNameBadge } from "@/components/breeding/HorseNameBadge";
import { HorsePicker } from "@/components/breeding/HorsePicker";
import { HorseAttributeSummary } from "@/components/breeding/HorseAttributeSummary";

export type BreedingProject = {
  id: number;
  title: string;
  notes: string;
};

export type AncestryEntry = { stallion?: any; mare?: any; title?: string };
export type AncestryMap = Record<number, AncestryEntry>;

type Props = {
  projects: BreedingProject[];
  pairingsByProject: Record<number, any[]>;
  onCreate: (title: string, notes: string) => void;
  onUpdate: (id: number, values: { title: string; notes: string }) => void;
  onDelete: (id: number) => void;
  onDropPairing: (pairingId: number, projectId: number | null) => void;
  onUpdateOutcome: (pairingId: number, outcome: string) => void;
  onRemovePairing: (pairingId: number) => void;
  onAddFoal: (pairingId: number, foalId: number) => void;
  onRemoveFoal: (pairingId: number, foalId: number) => void;
  onSetTries: (pairingId: number, tries: number) => void;
  ancestry?: AncestryMap;
};

type LineageProps = {
  pairing: any;
  onUpdateOutcome: (id: number, outcome: string) => void;
  onRemove: (id: number) => void;
  onAddFoal: (id: number, foalId: number) => void;
  onRemoveFoal: (id: number, foalId: number) => void;
  onSetTries: (id: number, tries: number) => void;
  footer?: React.ReactNode;
  ancestry?: AncestryMap;
};

const LineageChain = ({
  horseId,
  ancestry,
  depth = 0,
  visited = new Set<number>(),
}: {
  horseId: number;
  ancestry?: AncestryMap;
  depth?: number;
  visited?: Set<number>;
}) => {
  if (!ancestry || depth > 4 || visited.has(horseId)) return null;
  const entry = ancestry[horseId];
  if (!entry) return null;
  const nextVisited = new Set(visited);
  nextVisited.add(horseId);
  const parents = [entry.stallion, entry.mare].filter((p) => p?.id != null);
  if (!parents.length) return null;
  return (
    <div className="space-y-1 border-l-2 border-muted pl-2">
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[10px] font-bold uppercase text-muted-foreground">Born from</span>
        {parents.map((p) => (
          <HorseNameBadge key={p.id} horse={p} icon={p.gender === "stallion" ? "♂" : "♀"} className="text-[10px]" />
        ))}
        {entry.title ? <span className="text-[10px] text-muted-foreground">({entry.title})</span> : null}
      </div>
      {parents.map((p) => (
        <LineageChain key={p.id} horseId={p.id} ancestry={ancestry} depth={depth + 1} visited={nextVisited} />
      ))}
    </div>
  );
};

const ParentNode = ({ horse, role, icon, ancestry }: { horse: any; role: string; icon: string; ancestry?: AncestryMap }) => (
  <div className="rounded-md border bg-background p-3 space-y-2">
    <p className="text-[10px] font-bold uppercase text-muted-foreground">{role}</p>
    {horse?.name ? (
      <>
        <div className="flex items-center justify-between gap-2">
          <HorseNameBadge horse={horse} icon={icon} />
          {horse.tier != null && <Badge variant="outline">Tier {horse.tier}</Badge>}
        </div>
        <HorseAttributeSummary horse={horse} />
        {horse.id != null && <LineageChain horseId={horse.id} ancestry={ancestry} />}
      </>
    ) : (
      <p className="text-xs text-muted-foreground">Not recorded</p>
    )}
  </div>
);

export const BreedingLineageCard = ({
  pairing,
  onUpdateOutcome,
  onRemove,
  onAddFoal,
  onRemoveFoal,
  onSetTries,
  footer,
}: LineageProps) => {
  const [outcome, setOutcome] = useState(pairing.outcome || "");
  const dirty = outcome !== (pairing.outcome || "");
  const foals = pairing.foals || [];

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", String(pairing.id))}
      className="rounded-lg border bg-card cursor-grab active:cursor-grabbing overflow-hidden"
    >
      <div className="flex flex-wrap items-start justify-between gap-2 border-b bg-muted/30 p-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {pairing.target_tier != null && <Badge>Target tier {pairing.target_tier}</Badge>}
            <p className="font-semibold break-words">{pairing.title || "Breeding record"}</p>
          </div>
          {pairing.note && <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap break-words">{pairing.note}</p>}
        </div>
        <Button variant="ghost" size="icon" aria-label="Remove pairing" onClick={() => onRemove(pairing.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3 md:p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_2rem_minmax(0,1.25fr)] md:items-center">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1">
            <ParentNode horse={pairing.stallion} role="Stallion" icon="♂" />
            <ParentNode horse={pairing.mare} role="Mare" icon="♀" />
          </div>

          <div className="flex h-8 items-center justify-center md:h-full md:flex-col" aria-hidden="true">
            <span className="h-px flex-1 bg-border md:h-full md:w-px" />
            <span className="rounded-full border bg-background p-1.5 text-muted-foreground">
              <GitBranch className="h-4 w-4 rotate-90 md:rotate-0" />
            </span>
            <span className="h-px flex-1 bg-border md:h-full md:w-px" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">
                {foals.length === 1 ? "Foal" : `Foals · ${foals.length}`}
              </p>
              <HorsePicker gender="any" label="Foal" size="sm" triggerLabel="Add foal" onSelect={(h) => onAddFoal(pairing.id, h.id)} />
            </div>
            {foals.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
                No foal added yet
              </div>
            ) : (
              foals.map((foal: any, idx: number) => (
                <div key={`${foal.id}-${idx}`} className="rounded-md border-2 bg-background p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1">
                      <HorseNameBadge horse={foal} icon="🐴" />
                      {foal.tier != null && <Badge variant="outline">Tier {foal.tier}</Badge>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Remove foal" onClick={() => onRemoveFoal(pairing.id, foal.id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <HorseAttributeSummary horse={foal} />
                  {!foal.horse_traits?.length && <p className="text-[10px] text-muted-foreground">No traits registered on this foal.</p>}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 border-t pt-3 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Tries</span>
            <div className="flex items-center rounded-md border">
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Decrease tries" disabled={(pairing.tries ?? 0) <= 0} onClick={() => onSetTries(pairing.id, Math.max(0, (pairing.tries ?? 0) - 1))}>
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-8 text-center text-sm font-semibold tabular-nums">{pairing.tries ?? 0}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Increase tries" onClick={() => onSetTries(pairing.id, (pairing.tries ?? 0) + 1)}>
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Textarea placeholder="Outcome log (foal stats, traits, result...)" value={outcome} onChange={(e) => setOutcome(e.target.value)} rows={2} className="text-xs" />
            {dirty && (
              <Button size="sm" variant="secondary" onClick={() => onUpdateOutcome(pairing.id, outcome)}>
                <Save className="h-3.5 w-3.5" /> Save outcome
              </Button>
            )}
          </div>
        </div>
        {footer && <div className="mt-3 border-t pt-3">{footer}</div>}
      </div>
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
  onAddFoal,
  onRemoveFoal,
  onSetTries,
}: Props) => {
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [editing, setEditing] = useState<Record<number, { title: string; notes: string }>>({});

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-semibold">Breeding projects</h2>
          <p className="text-xs text-muted-foreground">Open a project to see its breeding lineage.</p>
        </div>
        <Card className="w-full sm:max-w-2xl">
          <CardContent className="grid gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-center">
            <Input placeholder="Race / goal" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Input placeholder="Notes: distance, surface, traits needed..." value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
            <Button size="sm" disabled={!newTitle.trim()} onClick={() => { onCreate(newTitle.trim(), newNotes.trim()); setNewTitle(""); setNewNotes(""); }}>
              <Plus className="h-4 w-4" /> Add race
            </Button>
          </CardContent>
        </Card>
      </div>

      {projects.length === 0 && <p className="text-sm text-muted-foreground">No races yet. Add one above.</p>}

      <div className="grid gap-3 xl:grid-cols-2">
        {projects.map((p) => {
          const isOpen = open[p.id] ?? false;
          const list = pairingsByProject[p.id] || [];
          const edit = editing[p.id];
          return (
            <Card
              key={p.id}
              onDragOver={(e) => { e.preventDefault(); setDragOver(p.id); }}
              onDragLeave={() => setDragOver((v) => (v === p.id ? null : v))}
              onDrop={(e) => { e.preventDefault(); setDragOver(null); const id = Number(e.dataTransfer.getData("text/plain")); if (id) onDropPairing(id, p.id); }}
              className={`${dragOver === p.id ? "ring-2 ring-primary" : ""} ${isOpen ? "xl:col-span-2" : ""}`}
            >
              <CardContent className="p-3 md:p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  {edit ? (
                    <div className="flex-1 space-y-2">
                      <Input value={edit.title} onChange={(e) => setEditing((s) => ({ ...s, [p.id]: { ...edit, title: e.target.value } }))} placeholder="Race / goal" className="h-8 text-sm font-semibold" />
                      <Textarea value={edit.notes} onChange={(e) => setEditing((s) => ({ ...s, [p.id]: { ...edit, notes: e.target.value } }))} placeholder="Race notes" rows={2} />
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" disabled={edit.title === p.title && edit.notes === p.notes} onClick={() => { onUpdate(p.id, { title: edit.title.trim(), notes: edit.notes }); setEditing((s) => { const n = { ...s }; delete n[p.id]; return n; }); }}><Save className="h-3.5 w-3.5" /> Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing((s) => { const n = { ...s }; delete n[p.id]; return n; })}><X className="h-3.5 w-3.5" /> Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="ghost" className="h-auto flex-1 justify-start whitespace-normal px-1 py-1 text-left" onClick={() => setOpen((o) => ({ ...o, [p.id]: !isOpen }))}>
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <span className="font-semibold break-words">{p.title || "Untitled race"}</span>
                      <Badge variant="outline">{list.length}</Badge>
                    </Button>
                  )}
                  <div className="flex shrink-0">
                    {!edit && <Button variant="ghost" size="icon" aria-label="Edit race label" onClick={() => setEditing((s) => ({ ...s, [p.id]: { title: p.title, notes: p.notes } }))}><Pencil className="h-4 w-4" /></Button>}
                    <Button variant="ghost" size="icon" aria-label="Delete race" onClick={() => onDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>

                {!edit && p.notes && <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{p.notes}</p>}

                {isOpen && (
                  <div className="space-y-3 border-t pt-3">
                    {list.length === 0 ? (
                      <p className="rounded-md border border-dashed p-5 text-center text-xs text-muted-foreground">Drop a pairing here</p>
                    ) : list.map((pair) => (
                      <BreedingLineageCard key={pair.id} pairing={pair} onUpdateOutcome={onUpdateOutcome} onRemove={onRemovePairing} onAddFoal={onAddFoal} onRemoveFoal={onRemoveFoal} onSetTries={onSetTries} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};