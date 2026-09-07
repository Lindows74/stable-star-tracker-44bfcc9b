
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface StatFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  min?: number;
  max?: number;
}

export const StatField = ({ control, name, label, min = 0, max = 300 }: StatFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-0">
          <div className="flex items-center gap-2 rounded-md border bg-card px-2 py-1.5">
            <FormLabel className="text-xs font-medium flex-1 truncate mb-0">{label}</FormLabel>
            <FormControl>
              <Input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={min}
                max={max}
                className="h-9 min-w-0 flex-1 px-2 text-right text-base font-semibold"
                value={typeof field.value === 'number' ? field.value.toString() : ""}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
