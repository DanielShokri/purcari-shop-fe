/**
 * Reusable style constants for consistent padding, margins, and layouts.
 */

export const theme = {
  // Section Spacing
  SECTION_PY: 'py-12 md:py-20',
  SECTION_PT: 'pt-12 md:pt-20',
  SECTION_PB: 'pb-12 md:pb-20',

  // Container Standards
  CONTAINER_PX: 'px-4 sm:px-6 lg:px-8',
  CONTAINER_MAX: 'max-w-7xl mx-auto',
  CONTAINER: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',

  // Typography
  H1: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900',
  H2: 'text-3xl md:text-4xl font-bold tracking-tight text-gray-900',
  H3: 'text-2xl md:text-3xl font-bold text-gray-900',
  BODY_LG: 'text-lg text-gray-600 leading-relaxed',
  BODY: 'text-base text-gray-600 leading-relaxed',

  // UI Components
  CARD: 'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden',
  CARD_HOVER: 'hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1',
  
  // Gaps
  GAP_SECTION: 'gap-12 lg:gap-16',
  GAP_COMPONENT: 'gap-6 md:gap-8',
};

export default theme;
