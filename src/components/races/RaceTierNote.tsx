import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

interface RaceTierNoteProps {
  raceId: number;
  tier: number;
  note: string;
  onSave: (raceId: number, tier: number, note: string) => Promise<void>;
  /** Tier label content (e.g. the tier number) */
  children: React.ReactNode;
  /** Class applied to the trigger button (used to color tier number) */
  triggerClassName?: string;
}

/**
 * Clickable tier label that opens a popover for editing a per-race, per-tier note.
 * Shows a small dot when a note exists.
 */
export function RaceTierNote({ raceId, tier, note, onSave, children, triggerClassName }: RaceTierNoteProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(note);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setDraft(note);
  }, [open, note]);

  const hasNote = note.trim().length > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(raceId, tier, draft);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative inline-flex items-center cursor-pointer hover:underline focus:outline-none",
            triggerClassName,
          )}
          aria-label={`Note for tier ${tier}`}
        >
          {children}
          {hasNote && (
            <span className="ml-0.5 inline-block w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold">
          <StickyNote className="h-3.5 w-3.5" />
          <span>Tier {tier} note</span>
        </div>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a note for this tier…"
          rows={4}
          className="text-xs"
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}