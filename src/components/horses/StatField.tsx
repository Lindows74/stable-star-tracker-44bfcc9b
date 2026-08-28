
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
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
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => {
                    const current = typeof field.value === 'number' ? field.value : 0;
                    field.onChange(Math.max(min, current - 1));
                  }}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={min}
                  max={max}
                  className="text-center w-14 h-9 px-1 text-base font-semibold"
                  value={typeof field.value === 'number' ? field.value.toString() : ""}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => {
                    const current = typeof field.value === 'number' ? field.value : 0;
                    field.onChange(Math.min(max, current + 1));
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>

      )}
    />
  );
};
