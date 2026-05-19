import { ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface StatsHorse {
  speed?: number | null;
  sprint_energy?: number | null;
  acceleration?: number | null;
  agility?: number | null;
  jump?: number | null;
  diet_speed?: number | null;
  diet_sprint_energy?: number | null;
  diet_acceleration?: number | null;
  diet_agility?: number | null;
  diet_jump?: number | null;
}

interface Props {
  horse: StatsHorse;
  name: string;
  children: ReactNode;
}

const Row = ({ label, base, diet }: { label: string; base?: number | null; diet?: number | null }) => {
  const b = base ?? 0;
  const d = diet ?? 0;
  const total = b + d;
  return (
    <div className="flex justify-between gap-4 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">
        {total}
        {d > 0 && <span className="text-green-500"> (+{d})</span>}
      </span>
    </div>
  );
};

export const HorseStatsPopover = ({ horse, name, children }: Props) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="text-left hover:underline focus:outline-none">
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2.5" align="start">
        <div className="text-xs font-semibold mb-1.5 truncate">{name}</div>
        <div className="space-y-1">
          <Row label="Speed" base={horse.speed} diet={horse.diet_speed} />
          <Row label="Sprint" base={horse.sprint_energy} diet={horse.diet_sprint_energy} />
          <Row label="Accel" base={horse.acceleration} diet={horse.diet_acceleration} />
          <Row label="Agility" base={horse.agility} diet={horse.diet_agility} />
          <Row label="Jump" base={horse.jump} diet={horse.diet_jump} />
        </div>
      </PopoverContent>
    </Popover>
  );
};