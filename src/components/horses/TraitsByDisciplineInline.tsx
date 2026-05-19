import { TraitBadge } from "./TraitBadge";
import { Separator } from "@/components/ui/separator";

interface TraitsByDisciplineInlineProps {
  traits: Array<{ trait_name: string; trait_value?: string }>;
  allTraitNames: string[];
}

// Trait categorization based on official guide (same as TraitsByDiscipline)
const TRAIT_CATEGORIES = {
  universal: [
    "Blazing Hoof", "Blazing Hoof Pro",
    "Fleet Dash", "Fleet Dash Pro", 
    "Agile Arrow", "Agile Arrow Pro",
    "Flash Ignite", "Flash Ignite Pro",
    "To The Moon", "To The Moon Pro"
  ],
  flatRacing: [
    "Endless Stride", "Endless Stride Pro",
    "Lightning Bolt",
    "Top Endurance", 
    "Steam Burst",
    "Hard N' Fast",
    "Thundering Hooves"
  ],
  steeplechase: [
    "Streak Shield", "Streak Shield Pro",
    "Leaping Star",
    "Perfect Step",
    "Leaping Lancer", 
    "Kinetic Boost"
  ],
  crossCountry: [
    "River Rider",
    "Fast Draw",
    "Revitalizing Surge",
    "Meadowstride",
    "Rolling Current", "Rolling Current Pro"
  ],
  multiDiscipline: [
  ],
  surfacePreference: [
    "Granite Gallop",
    "Mid Dash", 
    "Swampy Strider"
  ],
  distancePreference: [
    "Quick Gallop",
    "Swift Trot",
    "Steady Strider", 
    "Meadow Runner",
    "Endurance Charger",
    "Marathon Trotter",
    "Short Star",
    "Mid Miracle", 
    "Marathon Master"
  ],
  special: [
    "Energy Saver",
    "Thrifty Spender",
    "Elite Lineage",
    "Top Student",
    "Majestic Mane",
    "Crystal Coat",
    "Noble Braid"
  ]
};

const categorizeTraits = (traits: Array<{ trait_name: string; trait_value?: string }>) => {
  const categorized: Record<string, Array<{ trait_name: string; trait_value?: string }>> = {};
  
  traits.forEach(trait => {
    let category = 'special'; // default category
    
    for (const [cat, traitList] of Object.entries(TRAIT_CATEGORIES)) {
      if (traitList.includes(trait.trait_name)) {
        category = cat;
        break;
      }
    }
    
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(trait);
  });
  
  return categorized;
};

export const TraitsByDisciplineInline = ({ traits, allTraitNames }: TraitsByDisciplineInlineProps) => {
  if (!traits || traits.length === 0) {
    return null;
  }

  const categorizedTraits = categorizeTraits(traits);
  
  // Order categories by importance
  const categoryOrder = [
    'universal',
    'flatRacing', 
    'steeplechase',
    'crossCountry',
    'multiDiscipline',
    'surfacePreference',
    'distancePreference',
    'special'
  ];

  const nonEmptyCategories = categoryOrder.filter(category => 
    categorizedTraits[category] && categorizedTraits[category].length > 0
  );

  if (nonEmptyCategories.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {nonEmptyCategories.map((category, categoryIndex) => (
        <div key={category} className="flex items-center gap-1">
          {categorizedTraits[category].map((trait, traitIndex) => (
            <TraitBadge 
              key={`${category}-${traitIndex}`}
              traitName={trait.trait_name}
              allTraits={allTraitNames}
            />
          ))}
          {categoryIndex < nonEmptyCategories.length - 1 && (
            <div className="flex items-center mx-1">
              <div className="w-px h-3 bg-border"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};