import { useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { HorsePicker } from "@/components/breeding/HorsePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, Save, Timer, Trash2, Trophy, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRaceResults, type RaceResultRow } from "@/hooks/useRaceResults";
import { formatRaceLabel, formatRaceTime, parseRaceTime } from "@/utils/raceTimeUtils";

const RacesMade = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [horse, setHorse] = useState<any | null>(null);
  const [raceId, setRaceId] = useState<string>("");
  const [timeInput, setTimeInput] = useState("");

  const { data: races } = useQuery({
    queryKey: ["live_races_for_results"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_races")
        .select("id, race_name, surface, distance, tier_restriction")
        .order("race_name", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: results } = useRaceResults();

  const saveMutation = useMutation({
    mutationFn: async () => {
      const ms = parseRaceTime(timeInput);
      if (!horse) throw new Error("Choose a horse first");
      if (!raceId) throw new Error("Choose a race first");
      if (ms == null) throw new Error("Enter the time as m:ss.mmm, for example 1:23.456");

      const { error } = await supabase.from("race_results").insert({
        horse_id: horse.id,
        race_id: Number(raceId),
        time_ms: ms,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["race_results"] });
      setTimeInput("");
      toast({ title: "Saved", description: "Race result added." });
    },
    onError: (error: any) => {
      toast({
        title: "Could not save",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("race_results").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["race_results"] });
      toast({ title: "Removed", description: "Race result deleted." });
    },
  });

  // Group results by race, best time first
  const grouped = useMemo(() => {
    const byRace = new Map<number, RaceResultRow[]>();
    (results || []).forEach((row) => {
      if (!byRace.has(row.race_id)) byRace.set(row.race_id, []);
      byRace.get(row.race_id)!.push(row);
    });
    return Array.from(byRace.entries()).map(([id, rows]) => ({
      raceId: id,
      race: rows[0].live_races,
      rows: [...rows].sort((a, b) => a.time_ms - b.time_ms),
    }));
  }, [results]);

  return (
    <Layout>
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6 pb-24">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Races Made
          </h1>
          <p className="text-sm text-muted-foreground">
            Log which horse ran which live race and the finishing time.
          </p>
        </div>

        <Card>
          <CardHeader className="p-3 md:p-6 pb-2 md:pb-3">
            <CardTitle className="text-base md:text-lg">Add a race result</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Horse</label>
                {horse ? (
                  <div className="flex items-center justify-between gap-2 rounded-md border p-2">
                    <span className="text-sm font-medium truncate">
                      {horse.name}
                      {horse.tier != null && (
                        <Badge variant="secondary" className="ml-2 text-[10px]">
                          Tier {horse.tier}
                        </Badge>
                      )}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setHorse(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <HorsePicker gender="any" label="Horse" onSelect={setHorse} />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Race</label>
                <Select value={raceId} onValueChange={setRaceId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose race..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(races || []).map((race: any) => (
                      <SelectItem key={race.id} value={String(race.id)}>
                        {formatRaceLabel(race)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Time (m:ss.mmm)</label>
                <Input
                  placeholder="1:23.456"
                  inputMode="decimal"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="w-full md:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              Save result
            </Button>
          </CardContent>
        </Card>

        {grouped.length === 0 ? (
          <p className="text-sm text-muted-foreground">No race results yet.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            {grouped.map((group) => (
              <Card key={group.raceId}>
                <CardHeader className="p-3 md:p-4 pb-2">
                  <CardTitle className="text-sm md:text-base">{formatRaceLabel(group.race)}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0 space-y-1.5">
                  {group.rows.map((row, idx) => (
                    <div
                      key={row.id}
                      className="flex items-center justify-between gap-2 rounded-md border p-2 text-xs md:text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {idx === 0 && <Trophy className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                        <span className="font-medium truncate">{row.horses?.name || "Unknown horse"}</span>
                        {row.horses?.tier != null && (
                          <Badge variant="secondary" className="text-[10px]">Tier {row.horses.tier}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-mono">{formatRaceTime(row.time_ms)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => deleteMutation.mutate(row.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Button
        variant="secondary"
        size="icon"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-32 right-4 z-[110] rounded-full shadow-lg h-10 w-10"
        aria-label="Back to top"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </Layout>
  );
};

export default RacesMade;
