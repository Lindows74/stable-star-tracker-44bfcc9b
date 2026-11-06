const ODD_TIERS = new Set([3, 5, 7, 9]);
const EVEN_TIERS = new Set([2, 4, 6, 8]);

// Apply to both matching horses and historical-time candidates before ranking.
export const isHorseTierEligible = (
  restriction: string | null | undefined,
  tier: number | null | undefined,
): boolean => {
  const tiers = restriction === "odd_grades"
    ? ODD_TIERS
    : restriction === "even_grades"
      ? EVEN_TIERS
      : null;
  return tiers === null || (typeof tier === "number" && tiers.has(tier));
};