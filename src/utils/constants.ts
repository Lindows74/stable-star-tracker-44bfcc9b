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
  "Crystal Coat",
  "Elite Lineage",
  "Endless Stride",
  "Endless Stride Pro",
  "Endurance Charger",
  "Energy Saver",
  "Fast Draw",
  "Flash Ignite",
  "Flash Ignite Pro",
  "Fleet Dash",
  "Fleet Dash Pro",
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
  "River Rider",
  "Rolling Current",
  "Rolling Current Pro",
  "Short Star",
  "Steady Strider",
  "Steam Burst",
  "Streak Shield",
  "Streak Shield Pro",
  "Swampy Strider",
  "Swift Trot",
  "Thrifty Spender",
  "Thundering Hooves",
  "To The Moon",
  "To The Moon Pro",
  "Top Endurance",
  "Top Student"
] as const;

export type Category = typeof CATEGORIES[number];
export type Surface = typeof SURFACES[number];
export type Distance = typeof DISTANCES[number];
export type Position = typeof POSITIONS[number];
export type Trait = typeof TRAITS[number];
