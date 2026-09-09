// Helpers for race times entered as m:ss.mmm (e.g. 1:23.456)

export const parseRaceTime = (input: string): number | null => {
  const value = input.trim();
  if (!value) return null;

  // m:ss.mmm or m:ss
  const withMinutes = value.match(/^(\d{1,2}):([0-5]?\d)(?:[.,](\d{1,3}))?$/);
  if (withMinutes) {
    const [, m, s, ms] = withMinutes;
    const millis = ms ? Number(ms.padEnd(3, "0")) : 0;
    return Number(m) * 60000 + Number(s) * 1000 + millis;
  }

  // plain seconds, e.g. 83.456
  const secondsOnly = value.match(/^(\d{1,3})(?:[.,](\d{1,3}))?$/);
  if (secondsOnly) {
    const [, s, ms] = secondsOnly;
    const millis = ms ? Number(ms.padEnd(3, "0")) : 0;
    return Number(s) * 1000 + millis;
  }

  return null;
};

export const formatRaceTime = (ms: number): string => {
  if (ms == null || isNaN(ms)) return "-";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
};

export const formatRaceLabel = (race: any): string => {
  if (!race) return "Unknown race";
  const parts: string[] = [race.race_name];
  if (race.distance && race.distance !== "0") parts.push(`${race.distance}m`);
  if (race.surface) parts.push(String(race.surface).replace(/_/g, " "));
  return parts.join(" · ");
};
