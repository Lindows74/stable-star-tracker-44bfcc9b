/**
 * Horse utility functions for sorting, calculations, and status checks
 */

interface Horse {
  tier?: number;
  speed?: number;
  diet_speed?: number;
  sprint_energy?: number;
  diet_sprint_energy?: number;
  acceleration?: number;
  diet_acceleration?: number;
  agility?: number;
  diet_agility?: number;
  jump?: number;
  diet_jump?: number;
  max_speed?: boolean;
  max_sprint_energy?: boolean;
  max_acceleration?: boolean;
  max_agility?: boolean;
  max_jump?: boolean;
}

/**
 * Sort horses by tier (highest first), then by total stats
 */
export const sortHorses = (horses: any[]) => {
  return horses.sort((a, b) => {
    // First sort by tier (higher tier first)
    const tierA = a.tier || 0;
    const tierB = b.tier || 0;
    if (tierA !== tierB) {
      return tierB - tierA;
    }

    // Then by total speed (including diet bonus)
    const totalSpeedA = (a.speed || 0) + (a.diet_speed || 0);
    const totalSpeedB = (b.speed || 0) + (b.diet_speed || 0);
    if (totalSpeedA !== totalSpeedB) {
      return totalSpeedB - totalSpeedA;
    }

    // Then by total sprint energy (including diet bonus)
    const totalSprintEnergyA = (a.sprint_energy || 0) + (a.diet_sprint_energy || 0);
    const totalSprintEnergyB = (b.sprint_energy || 0) + (b.diet_sprint_energy || 0);
    if (totalSprintEnergyA !== totalSprintEnergyB) {
      return totalSprintEnergyB - totalSprintEnergyA;
    }

    // Then by total acceleration (including diet bonus)
    const totalAccelerationA = (a.acceleration || 0) + (a.diet_acceleration || 0);
    const totalAccelerationB = (b.acceleration || 0) + (b.diet_acceleration || 0);
    if (totalAccelerationA !== totalAccelerationB) {
      return totalAccelerationB - totalAccelerationA;
    }

    // Then by total agility (including diet bonus)
    const totalAgilityA = (a.agility || 0) + (a.diet_agility || 0);
    const totalAgilityB = (b.agility || 0) + (b.diet_agility || 0);
    if (totalAgilityA !== totalAgilityB) {
      return totalAgilityB - totalAgilityA;
    }

    // Finally by total jump (including diet bonus)
    const totalJumpA = (a.jump || 0) + (a.diet_jump || 0);
    const totalJumpB = (b.jump || 0) + (b.diet_jump || 0);
    return totalJumpB - totalJumpA;
  });
};

/**
 * Check if a horse has all stats max trained
 */
export const isMaxTrained = (horse: Horse): boolean => {
  return !!(
    horse.max_speed &&
    horse.max_sprint_energy &&
    horse.max_acceleration &&
    horse.max_agility &&
    horse.max_jump
  );
};

/**
 * Calculate total stat including diet bonus
 */
export const calculateTotalStat = (baseStat: number = 0, dietBonus: number = 0): number => {
  return baseStat + dietBonus;
};

/**
 * Get all max trained stat names for a horse
 */
export const getMaxTrainedStats = (horse: Horse): string[] => {
  return [
    horse.max_speed && "Speed",
    horse.max_sprint_energy && "Sprint Energy",
    horse.max_acceleration && "Acceleration",
    horse.max_agility && "Agility",
    horse.max_jump && "Jump"
  ].filter(Boolean) as string[];
};

/**
 * Calculate all total stats for display
 */
export const calculateAllStats = (horse: Horse) => {
  return {
    totalSpeed: calculateTotalStat(horse.speed, horse.diet_speed),
    totalSprintEnergy: calculateTotalStat(horse.sprint_energy, horse.diet_sprint_energy),
    totalAcceleration: calculateTotalStat(horse.acceleration, horse.diet_acceleration),
    totalAgility: calculateTotalStat(horse.agility, horse.diet_agility),
    totalJump: calculateTotalStat(horse.jump, horse.diet_jump),
  };
};
