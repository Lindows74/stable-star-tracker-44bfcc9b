export const OFFICIAL_TRAIT_CATEGORIES = {
  "General Traits": [
    "Blazing Hoof",
    "Fleet Dash",
    "Agile Arrow",
    "Flash Ignite",
    "To The Moon",
    "Energy Saver",
    "Endless Stride",
    "Rolling Current",
    "Streak Shield",
  ],
  "Surface Preference Traits": ["Granite Gallop", "Mid Dash", "Swampy Strider"],
  "Specific Game Mode Traits": [
    "Lightning Bolt",
    "Top Endurance",
    "Leaping Star",
    "Perfect Step",
    "River Rider",
    "Fast Draw",
  ],
  "Distance Preference Traits": [
    "Quick Gallop",
    "Swift Trot",
    "Steady Strider",
    "Meadow Runner",
    "Endurance Charger",
    "Marathon Trotter",
  ],
  "Exotic Traits": [
    "Steam Burst",
    "Short Star",
    "Mid Miracle",
    "Marathon Master",
    "Thundering Hooves",
    "Hard 'N' Fast",
    "Meadowstride",
    "Leaping Lancer",
    "Majestic Mane",
    "Crystal Coat",
    "Noble Braid",
    "Kinetic Boost",
  ],
  "Star Club Traits": ["Thrifty Spender", "Elite Lineage", "Top Student"],
} as const;

export const EXOTIC_TRAITS = new Set<string>(OFFICIAL_TRAIT_CATEGORIES["Exotic Traits"]);
export const STAR_CLUB_TRAITS = new Set<string>(OFFICIAL_TRAIT_CATEGORIES["Star Club Traits"]);

export const TRAIT_DISCIPLINES = {
  universal: ["Blazing Hoof", "Fleet Dash", "Agile Arrow", "Flash Ignite", "To The Moon"],
  flatRacing: ["Endless Stride", "Lightning Bolt", "Top Endurance", "Steam Burst", "Hard 'N' Fast", "Thundering Hooves"],
  steeplechase: ["Streak Shield", "Leaping Star", "Perfect Step", "Leaping Lancer", "Kinetic Boost"],
  crossCountry: ["River Rider", "Fast Draw", "Revitalizing Surge", "Meadowstride", "Rolling Current"],
  multiDiscipline: [],
  surfacePreference: ["Granite Gallop", "Mid Dash", "Swampy Strider"],
  distancePreference: ["Quick Gallop", "Swift Trot", "Steady Strider", "Meadow Runner", "Endurance Charger", "Marathon Trotter", "Short Star", "Mid Miracle", "Marathon Master"],
  special: ["Energy Saver", "Thrifty Spender", "Elite Lineage", "Top Student", "Majestic Mane", "Crystal Coat", "Noble Braid", "Wavy Mane", "Wavy Tail", "Classic Feathering", "Classic Braid"],
} satisfies Record<string, readonly string[]>;

export type TraitSpecialCategory = "exotic" | "star-club" | null;

export const getTraitSpecialCategory = (traitName: string): TraitSpecialCategory => {
  if (STAR_CLUB_TRAITS.has(traitName)) return "star-club";
  if (EXOTIC_TRAITS.has(traitName)) return "exotic";
  return null;
};