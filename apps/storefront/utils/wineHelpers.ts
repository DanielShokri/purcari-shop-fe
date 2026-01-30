/**
 * Wine type helper utilities
 * Derives wine type labels from product category
 */

/**
 * Get Hebrew wine type label from product category
 * @param category - Product category string (e.g., "rose-wine", "red-wine")
 * @returns Hebrew label for the wine type
 */
export const getWineTypeLabel = (category?: string): string => {
  const cat = category?.toLowerCase();
  
  if (cat?.includes('rose') || cat?.includes('rosé')) return 'רוזה';
  if (cat?.includes('red')) return 'יין אדום';
  if (cat?.includes('white')) return 'יין לבן';
  if (cat?.includes('sparkling')) return 'מבעבע';
  
  return 'יין';
};
