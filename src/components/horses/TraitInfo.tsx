import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Gauge, 
  Wind, 
  Timer, 
  Battery, 
  Target, 
  MapPin, 
  Mountain, 
  Waves, 
  Trees, 
  Footprints, 
  Star, 
  Crown, 
  DollarSign, 
  Rocket, 
  GraduationCap,
  LucideIcon,
  ArrowUp,
  Shield,
  Circle,
  Flame,
  TrendingUp,
  Moon,
  Rabbit,
  Bird,
  Turtle,
  Trophy,
  Droplets,
  Leaf,
  Swords,
  Diamond,
  Award,
  Sparkles,
  CloudLightning,
  HeartPulse,
  Coins
} from "lucide-react";

interface TraitInfo {
  icon: LucideIcon;
  description: string;
  category: string;
  isPro?: boolean;
}

// IMPORTANT: PRO TRAIT SYSTEM
// Pro traits are breed-specific elite versions of base traits.
// A trait becomes "Pro" (displayed with gold/yellow styling) when a horse has 
// 80% or more breeding of the specific breed associated with that trait.
// For example: "Blazing Hoof" → "Blazing Hoof Pro" at 80%+ Thoroughbred
// The breeding requirements are defined in horseTraitUtils.ts

export const TRAIT_INFO: Record<string, TraitInfo> = {
  // General Traits
  "Blazing Hoof": {
    icon: Flame,
    description: "Improved Speed across all game modes. Turns Pro if the horse is 80% Thoroughbred.",
    category: "General",
  },
  "Fleet Dash": {
    icon: Zap,
    description: "Improved Sprint Energy across all game modes. Turns Pro if the horse is 80% Arabian or Mustang.",
    category: "General",
  },
  "Agile Arrow": {
    icon: TrendingUp,
    description: "Improved Agility across all game modes. Turns Pro if the horse is 80% Knabstrupper or Friesian.",
    category: "General",
  },
  "Flash Ignite": {
    icon: Rocket,
    description: "Improved Acceleration across all game modes. Turns Pro if the horse is 80% QH.",
    category: "General",
  },
  "To The Moon": {
    icon: Moon,
    description: "Improved Jump across all game modes. Turns Pro if the horse is 80% Selle Francais or Knabstrupper.",
    category: "General",
  },
  "Energy Saver": {
    icon: Battery,
    description: "Story Races only costs 1 Career Energy.",
    category: "General",
  },
  "Endless Stride": {
    icon: Footprints,
    description: "On Flat Racing tracks of 2400m or more, gains improved acceleration and Sprint Energy lasts longer. Turns pro if horse is 80% or higher Akhal-Teke.",
    category: "General",
  },
  "Rolling Current": {
    icon: Waves,
    description: "On hard surfaces recharge extra Sprint Energy when jumping and gain improved Acceleration in Cross Country races. Turns pro if horse is 80% or higher Anglo-Arab.",
    category: "General",
  },
  "Streak Shield": {
    icon: Shield,
    description: "In SteepleChase mode, while a perfect streak is active, missing a perfect jump will not break the streak. Activates 2 times per race.",
    category: "General",
  },

  // Surface Preference Traits
  "Granite Gallop": {
    icon: Mountain,
    description: "Extends preference to hard and very hard surfaces.",
    category: "Surface",
  },
  "Mid Dash": {
    icon: Circle,
    description: "Extends preference to firm and medium surfaces.",
    category: "Surface",
  },
  "Swampy Strider": {
    icon: Droplets,
    description: "Extends preference to soft and very soft surfaces.",
    category: "Surface",
  },

  // Game Mode Specific Traits
  "Lightning Bolt": {
    icon: Zap,
    description: "Faster stamina refill rate during the final stretch in Flat Racing. Lightning Bolt can stack with Hard 'N' Fast to get even faster stamina refill during the final stretch of a race.",
    category: "Game Mode",
  },
  "Top Endurance": {
    icon: Battery,
    description: "Start with more Sprint Energy in Flat Racing.",
    category: "Game Mode",
  },
  "Leaping Star": {
    icon: Star,
    description: "Max jump streak in Steeplechase. Leaping Star can stack with Leaping Lancer to get an even further increased jump streak in Steeplechase.",
    category: "Game Mode",
  },
  "Perfect Step": {
    icon: Footprints,
    description: "Improved boost for perfect jumps in Steeplechase. Perfect Step can stack with Leaping Lancer to get an even greater improved boost after a perfect jump in Steeplechase.",
    category: "Game Mode",
  },
  "River Rider": {
    icon: Waves,
    description: "Horse is not slowed by water in Cross Country.",
    category: "Game Mode",
  },
  "Fast Draw": {
    icon: Zap,
    description: "Increased speed boost during jumps in Cross Country.",
    category: "Game Mode",
  },

  // Distance Preference Traits
  "Quick Gallop": {
    icon: Rabbit,
    description: "Extends preference to 800m and 900m.",
    category: "Distance",
  },
  "Swift Trot": {
    icon: Bird,
    description: "Extends preference to 1,000m, 1,100m, and 1,200m.",
    category: "Distance",
  },
  "Steady Strider": {
    icon: Turtle,
    description: "Extends preference to 1,400m and 1,600m.",
    category: "Distance",
  },
  "Meadow Runner": {
    icon: Trees,
    description: "Extends preference to 1,800m, 2,000m, and 2,200m.",
    category: "Distance",
  },
  "Endurance Charger": {
    icon: Mountain,
    description: "Extends preference to 2,400m and 2,600m.",
    category: "Distance",
  },
  "Marathon Trotter": {
    icon: Trophy,
    description: "Extends preference to 2,800m, 3,000m, and 3,200m.",
    category: "Distance",
  },

  // Exotic Traits
  "Steam Burst": {
    icon: Wind,
    description: "On Flat Racing tracks between 800m and 1200m, sprinting increases your acceleration and maximum top speed but uses more Sprint Energy.",
    category: "Exotic",
  },
  "Short Star": {
    icon: Star,
    description: "Extends preference range to include 1,200m and below.",
    category: "Exotic",
  },
  "Mid Miracle": {
    icon: Sparkles,
    description: "Extends preference range to include 1,400m to 2,200m.",
    category: "Exotic",
  },
  "Marathon Master": {
    icon: Award,
    description: "Extends preference range to include 2,400m and higher.",
    category: "Exotic",
  },
  "Thundering Hooves": {
    icon: CloudLightning,
    description: "Starts with full stamina bar. Extends preference range to include 2,800m and higher.",
    category: "Exotic",
  },
  "Hard 'N' Fast": {
    icon: Gauge,
    description: "Faster stamina refill rate during final stretch. Extends Preference range to include hard and very hard surfaces. Can stack with Lightning Bolt.",
    category: "Exotic",
  },
  "Meadowstride": {
    icon: Leaf,
    description: "Horse is not slowed down by water in Cross Country. Increased speed boost during jumps in Cross Country.",
    category: "Exotic",
  },
  "Leaping Lancer": {
    icon: Swords,
    description: "Max jump streak in Steeplechase is increased by 1. Improved boost when you perform a perfect jump in Steeplechase. Can stack with Leaping Star and with Perfect Step.",
    category: "Exotic",
  },
  "Majestic Mane": {
    icon: Sparkles,
    description: "The horse will have a Majestic, Long Mane.",
    category: "Exotic",
  },
  "Crystal Coat": {
    icon: Diamond,
    description: "A lustrous coat makes your horse shine like no other.",
    category: "Exotic",
  },
  "Noble Braid": {
    icon: Crown,
    description: "Tightly sewn braids that add refined charm to your horse's presence.",
    category: "Exotic",
  },
  "Kinetic Boost": {
    icon: Zap,
    description: "While your perfect jump streak is 5 or higher, receive bonus sprint energy on each subsequent perfect jump.",
    category: "Exotic",
  },

  // Star Club Traits
  "Thrifty Spender": {
    icon: Coins,
    description: "Reduced entry fee in Live Events.",
    category: "Star Club",
  },
  "Elite Lineage": {
    icon: Crown,
    description: "Foals born from this horse have +1 to all Base Stats except for A+.",
    category: "Star Club",
  },
  "Top Student": {
    icon: GraduationCap,
    description: "All foals bred from this horse have 20% of their possible XP but still require training.",
    category: "Star Club",
  },

  // Miscellaneous/Deprecated Traits
  "Revitalizing Surge": {
    icon: HeartPulse,
    description: "Regenerates Sprint Energy when passing gates in Cross Country.",
    category: "Misc",
  },

  // Friesian Cosmetic Traits
  "Wavy Mane": {
    icon: Sparkles,
    description: "Adds flowing, wavy styling to the mane. Exclusive to Friesians.",
    category: "Exotic",
  },
  "Wavy Tail": {
    icon: Sparkles,
    description: "Adds elegant waves to the tail. Exclusive to Friesians.",
    category: "Exotic",
  },
  "Classic Feathering": {
    icon: Sparkles,
    description: "Adds distinctive feathering around the lower legs. Exclusive to Friesians.",
    category: "Exotic",
  },
};

export const getTraitInfo = (traitName: string): TraitInfo | null => {
  return TRAIT_INFO[traitName] || null;
};
