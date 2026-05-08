// @ts-nocheck
import { theme } from './theme';

export * from './theme';
export * from './variants';

// CSS custom properties for theme tokens
export const cssVariables = {
  // Colors
  '--color-primary': theme.colors.primary[500],
  '--color-primary-hover': theme.colors.primary[600],
  '--color-primary-active': theme.colors.primary[700],
  '--color-secondary': theme.colors.secondary[500],
  '--color-secondary-hover': theme.colors.secondary[600],
  '--color-secondary-active': theme.colors.secondary[700],
  '--color-background': theme.colors.background[50],
  '--color-background-secondary': theme.colors.background[100],
  '--color-text': theme.colors.text[900],
  '--color-text-secondary': theme.colors.text[600],
  '--color-text-tertiary': theme.colors.text[400],
  '--color-border': theme.colors.border[300],
  '--color-border-hover': theme.colors.border[400],
  '--color-success': theme.colors.success[500],
  '--color-warning': theme.colors.warning[500],
  '--color-error': theme.colors.error[500],
  '--color-info': theme.colors.info[500],

  // Cinematic colors
  '--color-cinematic-ivory': theme.colors.cinematic.ivory,
  '--color-cinematic-gunmetal': theme.colors.cinematic.gunmetal,
  '--color-cinematic-charcoal': theme.colors.cinematic.charcoal,
  '--color-cinematic-silver': theme.colors.cinematic.silver,
  '--color-cinematic-gold': theme.colors.cinematic.gold,
  '--color-cinematic-crimson': theme.colors.cinematic.crimson,

  // Typography
  '--font-family-sans': theme.typography.fontFamily.sans.join(', '),
  '--font-family-serif': theme.typography.fontFamily.serif.join(', '),
  '--font-family-mono': theme.typography.fontFamily.mono.join(', '),
  '--font-size-base': theme.typography.fontSize.base[0],
  '--font-size-lg': theme.typography.fontSize.lg[0],
  '--font-size-xl': theme.typography.fontSize.xl[0],
  '--font-size-2xl': theme.typography.fontSize['2xl'][0],
  '--font-size-3xl': theme.typography.fontSize['3xl'][0],
  '--font-weight-normal': theme.typography.fontWeight.normal,
  '--font-weight-semibold': theme.typography.fontWeight.semibold,
  '--font-weight-bold': theme.typography.fontWeight.bold,

  // Spacing
  '--spacing-1': theme.spacing[1],
  '--spacing-2': theme.spacing[2],
  '--spacing-3': theme.spacing[3],
  '--spacing-4': theme.spacing[4],
  '--spacing-5': theme.spacing[5],
  '--spacing-6': theme.spacing[6],

  // Border radius
  '--radius-sm': theme.borderRadius.sm,
  '--radius-md': theme.borderRadius.md,
  '--radius-lg': theme.borderRadius.lg,
  '--radius-xl': theme.borderRadius.xl,

  // Shadows
  '--shadow-sm': theme.boxShadow.sm,
  '--shadow-base': theme.boxShadow.base,
  '--shadow-md': theme.boxShadow.md,
  '--shadow-lg': theme.boxShadow.lg,
} as const;

// Type-safe utility functions
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function getThemeColors() {
  return theme.colors;
}

export function getTypographyStyles() {
  return {
    fontFamily: {
      sans: theme.typography.fontFamily.sans.join(', '),
      serif: theme.typography.fontFamily.serif.join(', '),
      mono: theme.typography.fontFamily.mono.join(', '),
    },
    fontSize: theme.typography.fontSize,
    fontWeight: theme.typography.fontWeight,
    lineHeight: theme.typography.lineHeight,
    letterSpacing: theme.typography.letterSpacing,
  };
}

export function getSpacingStyles() {
  return theme.spacing;
}

export function getBorderRadiusStyles() {
  return theme.borderRadius;
}

// Animation utilities
export const animations = {
  fadeIn: {
    animation: 'fadeIn 0.3s ease-out forwards',
  },
  slideUp: {
    animation: 'slideUp 0.3s ease-out forwards',
  },
  slideDown: {
    animation: 'slideDown 0.3s ease-out forwards',
  },
  pulse: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
} as const;

// CSS keyframes for animations
export const keyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  slideUp: `
    @keyframes slideUp {
      from {
        transform: translateY(10px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,
  slideDown: `
    @keyframes slideDown {
      from {
        transform: translateY(-10px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,
} as const;
