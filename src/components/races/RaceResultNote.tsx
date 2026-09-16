import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

interface RaceResultNoteProps {
  horseName: string;
  note: string;
  onSave: (note: string) => Promise<void>;
}

/**
 * Small note button on a race result row. Opens a popover to write a note
 * about how this horse ran in this race. Turns amber when a note exists.
 */
export function RaceResultNote({ horseName, note, onSave }: RaceResultNoteProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(note);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setDraft(note);
  }, [open, note]);

  const hasNote = (note || "").trim().length > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7", hasNote ? "text-amber-500" : "text-muted-foreground")}
          aria-label={`Note for ${horseName}`}
        >
          <StickyNote className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold">
          <StickyNote className="h-3.5 w-3.5" />
          <span className="truncate">{horseName}</span>
        </div>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="How did this run go?"
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
