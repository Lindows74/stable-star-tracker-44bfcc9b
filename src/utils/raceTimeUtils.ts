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
    case "none":
      return "";
    default:
      return surface ? String(surface).replace(/_/g, " ") : "";
  }
};

export type RaceKind = "flat" | "sc" | "xc" | "sj";

export const isShowJumping = (race: any): boolean =>
  !!race && (race.surface === "none" || /show jumping/i.test(race.race_name || ""));

export const getRaceKind = (race: any): RaceKind => {
  if (!race) return "flat";
  if (isShowJumping(race)) return "sj";
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
  if (kind === "sj") return null;
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

export const formatRaceLabel = (race: any, numberOverride?: number | null): string => {
  if (!race) return "Unknown race";
  const kind = getRaceKind(race);
  const number = numberOverride !== undefined ? numberOverride : getRaceNumber(race);
  const parts: string[] = [];
  if (number) parts.push(`#${number}`);
  parts.push(kind === "xc" ? "XC" : kind === "sc" ? "SC" : kind === "sj" ? "SJ" : "Flat");
  if (kind !== "xc" && kind !== "sj" && race.distance && String(race.distance) !== "0") {
    parts.push(`${race.distance}m`);
  }
  if (kind !== "sj") {
    const surface = formatSurfaceShort(race.surface);
    if (surface) parts.push(surface);
  }
  if (kind === "sj") {
    if (race.tier_restriction === "odd_grades") parts.push("Odd");
    else if (race.tier_restriction === "even_grades") parts.push("Even");
  }
  return parts.join(" ");
};

// Canonical ordering of a full race list, matching the Live Events page:
// Flat first (official order, unknown ones last), then Steeplechase, then Cross Country.
export const sortRacesCanonically = <T extends Record<string, any>>(races: T[]): T[] => {
  const orderIndex = (race: any, order: { d: string; s: string }[]) => {
    const i = order.findIndex((o) => o.d === String(race.distance) && o.s === race.surface);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  const surfPref = ["very_hard", "very_soft", "hard", "firm", "medium", "soft"];

  const flats: T[] = [];
  const steeples: T[] = [];
  const cross: T[] = [];
  const showJumping: T[] = [];
  races.forEach((race) => {
    const kind = getRaceKind(race);
    if (kind === "sj") showJumping.push(race);
    else if (kind === "xc") cross.push(race);
    else if (kind === "sc") steeples.push(race);
    else flats.push(race);
  });
  showJumping.sort((a, b) => {
    const grade = (r: any) => (r.tier_restriction === "even_grades" ? 0 : 1);
    const d = grade(a) - grade(b);
    return d !== 0 ? d : (a.id || 0) - (b.id || 0);
  });

  const byOrder = (order: { d: string; s: string }[]) => (a: T, b: T) => {
    const d = orderIndex(a, order) - orderIndex(b, order);
    return d !== 0 ? d : (a.id || 0) - (b.id || 0);
  };

  cross.sort((a, b) => {
    const pref = (s: string) => {
      const i = surfPref.indexOf(s);
      return i === -1 ? surfPref.length : i;
    };
    const d = pref(a.surface) - pref(b.surface);
    return d !== 0 ? d : (a.id || 0) - (b.id || 0);
  });

  return [
    ...flats.sort(byOrder(FLAT_ORDER)),
    ...steeples.sort(byOrder(STEEPLE_ORDER)),
    ...cross,
    ...showJumping,
  ];
};

// Race number per race id, derived from the full list so newly added races
// (e.g. a new Cross Country surface) always get a number.
export const buildRaceNumberMap = (races: any[] = []): Map<number, number> => {
  const sorted = sortRacesCanonically(races);
  const map = new Map<number, number>();
  const seen = new Map<string, number>();
  let next = 1;
  sorted.forEach((race) => {
    const key = `${getRaceKind(race)}|${race.surface}|${race.distance}|${race.tier_restriction || ""}`;
    const existing = seen.get(key);
    if (existing != null) {
      map.set(race.id, existing);
      return;
    }
    seen.set(key, next);
    map.set(race.id, next);
    next += 1;
  });
  return map;
};

// The races shown in Live Events: cross country is deduped by surface + tier
// restriction (the same rule Live Events uses), everything else is kept as is.
export const dedupeRacesLikeLiveEvents = <T extends Record<string, any>>(races: T[] = []): T[] => {
  const sorted = sortRacesCanonically(races);
  // Live Events keeps the LAST duplicate for a surface|tier key (Map overwrite),
  // but in the position of the FIRST one. Mirror that exactly so names match.
  const crossByKey = new Map<string, T>();
  const dedupKey = (race: any) => `${getRaceKind(race)}|${race.surface}|${race.tier_restriction || ""}`;
  const isDeduped = (race: any) => {
    const kind = getRaceKind(race);
    return kind === "xc" || kind === "sj";
  };
  sorted.forEach((race) => {
    if (!isDeduped(race)) return;
    crossByKey.set(dedupKey(race), race);
  });
  const usedKeys = new Set<string>();
  const out: T[] = [];
  sorted.forEach((race) => {
    if (!isDeduped(race)) {
      out.push(race);
      return;
    }
    const key = dedupKey(race);
    if (usedKeys.has(key)) return;
    usedKeys.add(key);
    out.push(crossByKey.get(key) as T);
  });
  return out;
};


