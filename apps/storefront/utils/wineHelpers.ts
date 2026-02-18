/**
 * Wine type helper utilities
 * Derives wine type labels from product wineType
 */

/**
 * Get Hebrew wine type label from product wineType
 * @param wineType - Product wineType string (e.g., "Red", "White", "Rosé", "Sparkling")
 * @returns Hebrew label for the wine type
 */
export const getWineTypeLabel = (wineType?: string): string => {
  const type = wineType?.toLowerCase();

  if (type?.includes('rose') || type?.includes('rosé')) return 'רוזה';
  if (type?.includes('red')) return 'יין אדום';
  if (type?.includes('white')) return 'יין לבן';
  if (type?.includes('sparkling')) return 'מבעבע';

  return 'יין';
};
