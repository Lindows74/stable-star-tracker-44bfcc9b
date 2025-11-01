/**
 * Filter utilities for array manipulation and tier validation
 */

/**
 * Toggle a value in an array (add if not present, remove if present)
 */
export const toggleArrayValue = <T>(
  array: T[],
  setValue: (value: T[]) => void,
  value: T
): void => {
  if (array.includes(value)) {
    setValue(array.filter(item => item !== value));
  } else {
    setValue([...array, value]);
  }
};

/**
 * Validate and clamp tier input to valid range (1-10)
 * Returns null if invalid
 */
export const validateTierInput = (tierInput: string): number | null => {
  const n = parseInt(tierInput, 10);
  if (isNaN(n)) return null;
  return Math.min(10, Math.max(1, n));
};
