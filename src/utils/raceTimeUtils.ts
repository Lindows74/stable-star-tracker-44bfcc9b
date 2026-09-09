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

// Canonical race order (same as Live Events): 17 flat, 3 steeplechase, 2 cross country
const FLAT_ORDER = [
  { d: "800", s: "very_soft" },
  { d: "900", s: "firm" },
  { d: "1000", s: "hard" },
  { d: "1200", s: "medium" },
  { d: "1200", s: "very_soft" },
  { d: "1400", s: "medium" },
  { d: "1600", s: "firm" },
  { d: "1600", s: "hard" },
  { d: "1600", s: "very_hard" },
  { d: "1800", s: "very_hard" },
  { d: "2000", s: "hard" },
  { d: "2000", s: "soft" },
  { d: "2400", s: "firm" },
  { d: "2800", s: "very_hard" },
  { d: "3000", s: "hard" },
  { d: "3200", s: "soft" },
  { d: "3200", s: "very_hard" },
];

const STEEPLE_ORDER = [
  { d: "900", s: "very_hard" },
  { d: "1100", s: "very_hard" },
  { d: "1400", s: "firm" },
];

const CROSS_ORDER = ["very_hard", "very_soft"];

export const formatSurfaceShort = (surface?: string | null): string => {
  switch (surface) {
    case "very_hard":
      return "VH";
    case "hard":
      return "H";
    case "firm":
      return "F";
    case "medium":
      return "M";
    case "soft":
      return "S";
    case "very_soft":
      return "VS";
    default:
      return surface ? String(surface).replace(/_/g, " ") : "";
  }
};

export type RaceKind = "flat" | "sc" | "xc";

export const getRaceKind = (race: any): RaceKind => {
  if (!race) return "flat";
  const distance = String(race.distance ?? "");
  if (distance === "0" || /cross country/i.test(race.race_name || "")) return "xc";
  if (/steeplechase/i.test(race.race_name || "")) return "sc";
  if (STEEPLE_ORDER.some((o) => o.d === distance && o.s === race.surface)) return "sc";
  return "flat";
};

// Race number matching the numbering used in Live Events (1-22)
export const getRaceNumber = (race: any): number | null => {
  if (!race) return null;
  const kind = getRaceKind(race);
  const distance = String(race.distance ?? "");
  if (kind === "xc") {
    const idx = CROSS_ORDER.indexOf(race.surface);
    return idx === -1 ? null : FLAT_ORDER.length + STEEPLE_ORDER.length + idx + 1;
  }
  if (kind === "sc") {
    const idx = STEEPLE_ORDER.findIndex((o) => o.d === distance && o.s === race.surface);
    return idx === -1 ? null : FLAT_ORDER.length + idx + 1;
  }
  const idx = FLAT_ORDER.findIndex((o) => o.d === distance && o.s === race.surface);
  return idx === -1 ? null : idx + 1;
};

export const formatRaceLabel = (race: any): string => {
  if (!race) return "Unknown race";
  const kind = getRaceKind(race);
  const number = getRaceNumber(race);
  const parts: string[] = [];
  if (number) parts.push(`#${number}`);
  parts.push(kind === "xc" ? "XC" : kind === "sc" ? "SC" : "Flat");
  if (kind === "flat" && race.distance && String(race.distance) !== "0") {
    parts.push(`${race.distance}m`);
  }
  const surface = formatSurfaceShort(race.surface);
  if (surface) parts.push(surface);
  return parts.join(" ");
};

