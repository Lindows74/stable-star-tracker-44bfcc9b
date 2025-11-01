/**
 * Application-wide constants for horse racing
 */

export const CATEGORIES = ["flat_racing", "steeplechase", "cross_country", "misc"] as const;

export const SURFACES = [
  "very_hard",
  "hard", 
  "firm",
  "medium",
  "soft",
  "very_soft"
] as const;

export const DISTANCES = [
  "800",
  "900",
  "1000",
  "1100",
  "1200",
  "1400",
  "1600",
  "1800",
  "2000",
  "2200",
  "2400",
  "2600",
  "2800",
  "3000",
  "3200"
] as const;

export const POSITIONS = ["front", "middle", "back"] as const;

export const TRAITS = [
  "Agile Arrow",
  "Agile Arrow Pro",
  "Blazing Hoof",
  "Blazing Hoof Pro",
  "Fast Draw",
  "Flash Ignite",
  "Flash Ignite Pro",
  "Fleet Dash",
  "Fleet Dash Pro",
  "Lightning Bolt",
  "Quick Gallop",
  "Swift Trot",
  "Thundering Hooves",
  "Endurance Charger",
  "Energy Saver",
  "Marathon Master",
  "Marathon Trotter",
  "Top Endurance",
  "Mid Dash",
  "Mid Miracle",
  "Short Star",
  "Granite Gallop",
  "Hard N' Fast",
  "Meadow Runner",
  "Meadowstride",
  "River Rider",
  "Steady Strider",
  "Swampy Strider",
  "Leaping Lancer",
  "Leaping Star",
  "Perfect Step",
  "Elite Lineage",
  "Thrifty Spender",
  "To the Moon",
  "Top Student",
  "Revitalizing Surge",
  "Steam Burst",
  "Majestic Mane",
  "Crystal Coat"
] as const;

export type Category = typeof CATEGORIES[number];
export type Surface = typeof SURFACES[number];
export type Distance = typeof DISTANCES[number];
export type Position = typeof POSITIONS[number];
export type Trait = typeof TRAITS[number];
