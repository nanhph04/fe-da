/**
 * Theme utility functions for consistent styling
 */

import { theme } from '../tokens/theme';

/**
 * Color utilities with proper theming
 */
export const colors = {
  // Primary color utilities
  primary: (shade: number) => theme.colors.primary[shade as keyof typeof theme.colors.primary],

  // Secondary color utilities
  secondary: (shade: number) => theme.colors.secondary[shade as keyof typeof theme.colors.secondary],

  // Background utilities
  background: (shade: number) => theme.colors.background[shade as keyof typeof theme.colors.background],

  // Text utilities
  text: (shade: number) => theme.colors.text[shade as keyof typeof theme.colors.text],

  // Border utilities
  border: (shade: number) => theme.colors.border[shade as keyof typeof theme.colors.border],

  // Semantic colors
  success: (shade: number) => theme.colors.success[shade as keyof typeof theme.colors.success],
  error: (shade: number) => theme.colors.error[shade as keyof typeof theme.colors.error],
  warning: (shade: number) => theme.colors.warning[shade as keyof typeof theme.colors.warning],
  info: (shade: number) => theme.colors.info[shade as keyof typeof theme.colors.info],
};

/**
 * Common color combinations
 */
export const colorSchemes = {
  // Primary button scheme
  primaryButton: {
    bg: colors.primary(600),
    hover: colors.primary(700),
    text: 'text-black',
    border: colors.border(700),
  },

  // Secondary button scheme
  secondaryButton: {
    bg: colors.secondary(600),
    hover: colors.secondary(700),
    text: 'text-black',
    border: colors.border(700),
  },

  // Card scheme
  card: {
    bg: colors.background(950),
    border: colors.border(700),
    text: {
      primary: colors.text(50),
      secondary: colors.text(400),
    },
  },

  // Input scheme
  input: {
    bg: colors.background(950),
    border: colors.border(700),
    focus: colors.primary(600),
    text: colors.text(50),
  },
};

/**
 * CSS class generators
 */
export const classes = {
  // Button classes with theme colors
  button: (variant: 'primary' | 'secondary' | 'ghost' | 'outline' = 'primary') => {
    const schemes = {
      primary: `bg-${colors.primary(600)} hover:bg-${colors.primary(700)} text-black border-${colors.border(700)} shadow-[${colors.primary(600)}]/20`,
      secondary: `bg-${colors.secondary(600)} hover:bg-${colors.secondary(700)} text-black border-${colors.border(700)} shadow-[${colors.secondary(600)}]/20`,
      ghost: `bg-transparent hover:bg-${colors.border(700)} text-${colors.primary(600)} border-transparent`,
      outline: `bg-transparent text-${colors.primary(600)} border-${colors.primary(600)} hover:bg-${colors.primary(600)}/10`,
    };

    return schemes[variant];
  },

  // Card classes
  card: 'bg-' + colorSchemes.card.bg + ' border-' + colorSchemes.card.border,

  // Input classes
  input: `bg-${colorSchemes.input.bg} border-${colorSchemes.input.border} text-${colorSchemes.input.text} focus:ring-2 focus:ring-${colorSchemes.input.focus} focus:border-${colorSchemes.input.focus}`,
};

/**
 * Gradient utilities
 */
export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary(600)} 0%, ${colors.primary(700)} 100%)`,
  secondary: `linear-gradient(135deg, ${colors.secondary(600)} 0%, ${colors.secondary(700)} 100%)`,
  cinematic: `linear-gradient(180deg, ${colors.background(950)} 0%, ${colors.background(900)} 100%)`,
};

/**
 * Shadow utilities
 */
export const shadows = {
  primary: `shadow-lg shadow-[${colors.primary(600)}]/20`,
  secondary: `shadow-lg shadow-[${colors.secondary(600)}]/20`,
  card: `shadow-lg shadow-[${colors.border(700)}]/10`,
};

/**
 * Animation utilities
 */
export const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
};

/**
 * Responsive utilities
 */
export const responsive = {
  mobile: (value: string) => `sm:${value}`,
  tablet: (value: string) => `md:${value}`,
  desktop: (value: string) => `lg:${value}`,
  wide: (value: string) => `xl:${value}`,
};

/**
 * Common layout utilities
 */
export const layout = {
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  grid: {
    default: 'grid grid-cols-1 gap-6',
    md: 'grid grid-cols-2 gap-6 md:grid-cols-3',
    lg: 'grid grid-cols-3 gap-6 lg:grid-cols-4',
    xl: 'grid grid-cols-4 gap-6 xl:grid-cols-5',
  },
};

/**
 * Typography utilities
 */
export const typography = {
  // Font sizes with line heights
  heading1: 'text-5xl font-bold font-headline leading-tight',
  heading2: 'text-4xl font-bold font-headline leading-tight',
  heading3: 'text-3xl font-semibold font-headline leading-tight',
  heading4: 'text-2xl font-semibold font-headline leading-tight',
  body: 'text-base font-body leading-relaxed',
  caption: 'text-sm font-medium text-gray-400 uppercase tracking-widest',
};

/**
 * Spacing utilities
 */
export const spacing = {
  xs: 'px-3 py-1.5',
  sm: 'px-4 py-2',
  md: 'px-6 py-3',
  lg: 'px-8 py-4',
  xl: 'px-10 py-6',
};

/**
 * Border radius utilities
 */
export const rounded = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-full',
};

/**
 * Export all theme utilities
 */
export default {
  colors,
  colorSchemes,
  classes,
  gradients,
  shadows,
  animations,
  responsive,
  layout,
  typography,
  spacing,
  rounded,
};