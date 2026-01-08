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
  "Blazing Hoof",
  "Crystal Coat",
  "Elite Lineage",
  "Endless Stride",
  "Endurance Charger",
  "Energy Saver",
  "Fast Draw",
  "Flash Ignite",
  "Fleet Dash",
  "Granite Gallop",
  "Hard 'N' Fast",
  "Kinetic Boost",
  "Leaping Lancer",
  "Leaping Star",
  "Lightning Bolt",
  "Majestic Mane",
  "Marathon Master",
  "Marathon Trotter",
  "Meadow Runner",
  "Meadowstride",
  "Mid Dash",
  "Mid Miracle",
  "Noble Braid",
  "Perfect Step",
  "Quick Gallop",
  "Revitalizing Surge",
  "River Rider",
  "Rolling Current",
  "Short Star",
  "Steady Strider",
  "Steam Burst",
  "Streak Shield",
  "Swampy Strider",
  "Swift Trot",
  "Thrifty Spender",
  "Thundering Hooves",
  "To The Moon",
  "Top Endurance",
  "Top Student",
  "Wavy Mane",
  "Wavy Tail",
  "Classic Feathering"
] as const;

export type Category = typeof CATEGORIES[number];
export type Surface = typeof SURFACES[number];
export type Distance = typeof DISTANCES[number];
export type Position = typeof POSITIONS[number];
export type Trait = typeof TRAITS[number];
