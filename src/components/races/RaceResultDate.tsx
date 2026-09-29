import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Loader2 } from "lucide-react";
import { formatResultDate } from "@/utils/raceTimeUtils";

interface RaceResultDateProps {
  horseName: string;
  racedAt: string;
  onSave: (isoDate: string) => Promise<void>;
}

// yyyy-mm-dd in local time for the date input
const toDateInputValue = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * The date of a saved race result, shown as "30 sept -26".
 * Clicking it opens a popover to change the date.
 */
export function RaceResultDate({ horseName, racedAt, onSave }: RaceResultDateProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(toDateInputValue(racedAt));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setDraft(toDateInputValue(racedAt));
  }, [open, racedAt]);

  const handleSave = async () => {
    if (!draft) return;
    // Keep the original time of day, only change the calendar date
    const original = new Date(racedAt);
    const [y, m, day] = draft.split("-").map(Number);
    const next = new Date(
      y,
      (m || 1) - 1,
      day || 1,
      original.getHours(),
      original.getMinutes(),
      original.getSeconds(),
      original.getMilliseconds()
    );
    setSaving(true);
    try {
      await onSave(next.toISOString());
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const label = formatResultDate(racedAt);
  if (!label) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-[10px] text-muted-foreground gap-1"
          aria-label={`Date for ${horseName}`}
        >
          <CalendarDays className="h-3 w-3" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="end">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold">
          <CalendarDays className="h-3.5 w-3.5" />
          <span className="truncate">{horseName}</span>
        </div>
        <Input
          type="date"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="text-xs h-8"
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={saving || !draft}>
            {saving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
