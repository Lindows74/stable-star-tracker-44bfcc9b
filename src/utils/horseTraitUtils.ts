// Define which traits can stack together
const SPEED_STACKING_TRAITS = [
  ["Lightning Bolt", "Hard 'N' Fast", "Hard N' Fast", "Hard n´Fast"], // Faster stamina refill during final stretch - handle both apostrophe variations
];

const JUMPING_STACKING_TRAITS = [
  ["Leaping Star", "Leaping Lancer"], // Enhanced jump streak in Steeplechase
  ["Perfect Step", "Leaping Lancer"], // Enhanced boost after perfect jump in Steeplechase
];

const STACKING_TRAIT_GROUPS = [...SPEED_STACKING_TRAITS, ...JUMPING_STACKING_TRAITS];

// Define traits that provide full stamina benefits
const FULL_STAMINA_TRAITS = [
  "Top Endurance", // Start with more Sprint Energy in Flat Racing
  "Thundering Hooves", // Starts with full stamina bar
];

export const checkHorseHasStackingTraits = (horseTraits: string[]): boolean => {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[’´`]/g, "'").replace(/\s+/g, ' ').trim().replace("hard n' fast", "hard 'n' fast");
  const normalizedSet = new Set(horseTraits.map(normalize));
  return STACKING_TRAIT_GROUPS.some(group => {
    const traitsInGroup = group.map(normalize).filter(trait => normalizedSet.has(trait));
    return traitsInGroup.length >= 2;
  });
};

export const checkHorseHasSpeedStackingTraits = (horseTraits: string[]): boolean => {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[’´`]/g, "'").replace(/\s+/g, ' ').trim().replace("hard n' fast", "hard 'n' fast");
  const normalizedSet = new Set(horseTraits.map(normalize));
  console.log('checkHorseHasSpeedStackingTraits - Input traits:', horseTraits);
  console.log('SPEED_STACKING_TRAITS:', SPEED_STACKING_TRAITS);
  
  const result = SPEED_STACKING_TRAITS.some(group => {
    const normalizedGroup = group.map(normalize);
    const traitsInGroup = normalizedGroup.filter(trait => normalizedSet.has(trait));
    console.log(`Checking group ${JSON.stringify(group)} - normalized: ${JSON.stringify(normalizedGroup)} - found traits:`, Array.from(traitsInGroup));
    return traitsInGroup.length >= 2;
  });
  
  console.log('Speed stacking result:', result);
  return result;
};

export const checkHorseHasJumpingStackingTraits = (horseTraits: string[]): boolean => {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[’´`]/g, "'").replace(/\s+/g, ' ').trim().replace("hard n' fast", "hard 'n' fast");
  const normalizedSet = new Set(horseTraits.map(normalize));
  return JUMPING_STACKING_TRAITS.some(group => {
    // Check if horse has at least 2 traits from the same stacking group
    const traitsInGroup = group.map(normalize).filter(trait => normalizedSet.has(trait));
    return traitsInGroup.length >= 2;
  });
};

export const checkHorseHasFullStaminaTrait = (horseTraits: string[]): boolean => {
  return FULL_STAMINA_TRAITS.some(trait => horseTraits.includes(trait));
};

// IMPORTANT: PRO TRAIT SYSTEM
// Pro traits are displayed with a special gold/yellow color and marked as "Pro" in the UI.
// A trait becomes "Pro" when a horse has 80% or more breeding of the specific breed(s) 
// associated with that trait. For example, "Blazing Hoof" becomes "Blazing Hoof Pro" 
// when the horse is 80%+ Thoroughbred.
// 
// This mapping defines which breeds are required for each trait to achieve Pro status.
// The checkTraitShouldBePro function uses this mapping along with horse_breeding data
// to determine if a trait should display as Pro for a specific horse.

const TRAIT_BREEDING_REQUIREMENTS = {
  "Blazing Hoof": ["Thoroughbred"],
  "Fleet Dash": ["Arabian", "Mustang"],  
  "Agile Arrow": ["Knabstrupper", "Friesian"],
  "Flash Ignite": ["Quarter Horse"],
  "To The Moon": ["Selle Francais", "Knabstrupper"],
  "Endless Stride": ["Akhal-Teke"],
  "Rolling Current": ["Anglo-Arab"],
};

// Check if a trait should be displayed as Pro based on breeding percentages
export const checkTraitShouldBePro = (
  traitName: string, 
  horseBreeding: Array<{percentage: number, breeds: {name: string}}>
): boolean => {
  const requiredBreeds = TRAIT_BREEDING_REQUIREMENTS[traitName as keyof typeof TRAIT_BREEDING_REQUIREMENTS];
  
  if (!requiredBreeds || !horseBreeding) return false;
  
  return requiredBreeds.some(requiredBreed => {
    const breedMatch = horseBreeding.find(breeding => 
      breeding.breeds?.name === requiredBreed
    );
    return breedMatch && breedMatch.percentage >= 80;
  });
};

export const getHorseSpecialIcons = (horseTraits: string[]): string => {
  const icons = [];
  
  if (checkHorseHasSpeedStackingTraits(horseTraits)) {
    icons.push('🔥');
  }
  
  if (checkHorseHasJumpingStackingTraits(horseTraits)) {
    icons.push('🐸');
  }
  
  if (checkHorseHasFullStaminaTrait(horseTraits)) {
    icons.push('💯');
  }
  
  return icons.join(' ');
};