
import { FormLabel } from "@/components/ui/form";
import { StatField } from "./StatField";
import { Control } from "react-hook-form";

interface StatSectionProps {
  control: Control<any>;
  title: string;
  stats: Array<{ name: string; label: string; min?: number; max?: number; }>;
}

export const StatSection = ({ control, title, stats }: StatSectionProps) => {
  return (
    <div>
      <FormLabel className="text-base font-semibold">{title}</FormLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
        {stats.map((stat) => (
          <StatField
            key={stat.name}
            control={control}
            name={stat.name}
            label={stat.label}
            min={stat.min}
            max={stat.max}
          />
        ))}
      </div>
    </div>
  );
};
