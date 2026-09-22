import { TraitBadge } from "./TraitBadge";
import { Separator } from "@/components/ui/separator";
import { TRAIT_DISCIPLINES } from "@/utils/traitMetadata";

interface TraitsByDisciplineInlineProps {
  traits: Array<{ trait_name: string; trait_value?: string }>;
  allTraitNames: string[];
  horseBreeding?: Array<{ percentage: number; breeds: { name: string } }>;
}

// Trait categorization based on official guide (same as TraitsByDiscipline)
const TRAIT_CATEGORIES = TRAIT_DISCIPLINES;

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

export const TraitsByDisciplineInline = ({ traits, allTraitNames, horseBreeding }: TraitsByDisciplineInlineProps) => {
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
              horseBreeding={horseBreeding}
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