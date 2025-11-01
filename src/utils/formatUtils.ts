/**
 * Formatting utilities for display text
 */

/**
 * Format snake_case or hyphenated strings to Title Case
 * Example: "flat_racing" -> "Flat Racing"
 */
export const formatLabel = (value: string): string => {
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Format surface name by replacing underscores with spaces and capitalizing
 * Example: "very_hard" -> "Very Hard"
 */
export const formatSurface = (surface: string): string => {
  return surface
    .replace('_', ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Format date and time string to localized format
 * Example: "2024-01-15T14:30:00Z" -> "1/15/2024 2:30 PM"
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Get gender-specific background class for horse name display
 */
export const getGenderNameBackgroundClass = (gender: string): string => {
  if (gender === 'stallion') return 'bg-blue-200 border border-blue-300';
  if (gender === 'mare') return 'bg-pink-200 border border-pink-300';
  return 'bg-gray-200 border border-gray-300';
};
