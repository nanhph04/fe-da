// @ts-nocheck
import { theme } from './theme';

export const variants = {
  // Button variants
  button: {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 transition-colors',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 transition-colors',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors',
    destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700 transition-colors',
    link: 'text-blue-600 hover:underline underline-offset-4',
  },

  // Input variants
  input: {
    default: 'border-gray-300 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
    filled: 'border-transparent bg-gray-100 hover:bg-gray-200 focus:bg-gray-200',
    outlined: 'border-2 border-gray-300 bg-transparent hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
    error: 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-500',
    success: 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-1 focus:ring-green-500',
  },

  // Card variants
  card: {
    default: 'bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow',
    elevated: 'bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-shadow',
    outlined: 'bg-white border-2 border-gray-300 hover:border-gray-400 transition-colors',
    ghost: 'bg-transparent border border-gray-200 hover:border-gray-300 transition-colors',
  },

  // Modal variants
  modal: {
    default: 'bg-white border border-gray-200 shadow-xl',
    dark: 'bg-gray-900 border border-gray-700 shadow-2xl',
    overlay: 'bg-black bg-opacity-50 backdrop-blur-sm',
  },

  // Table variants
  table: {
    default: 'bg-white border border-gray-200',
    striped: 'bg-white border border-gray-200',
    bordered: 'bg-white border border-gray-200',
  },

  // Form variants
  form: {
    default: 'space-y-4',
    inline: 'space-x-4 space-y-0',
    compact: 'space-y-2',
  },

  // Semantic button intents
  intent: {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 transition-colors',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 transition-colors',
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 transition-colors',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800 transition-colors',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors',
    info: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors',
  },
} as const;

export const semanticVariants = {
  // Semantic button variants based on intent
  intent: {
    primary: variants.button.primary,
    secondary: variants.button.secondary,
    success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 transition-colors',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800 transition-colors',
    danger: variants.button.destructive,
    info: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors',
  },

  // Semantic status variants
  status: {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-orange-100 text-orange-800',
  },

  // Size variants
  size: {
    xs: 'text-xs px-2 py-1 rounded',
    sm: 'text-sm px-3 py-1.5 rounded-sm',
    md: 'text-base px-4 py-2 rounded',
    lg: 'text-lg px-6 py-3 rounded-lg',
    xl: 'text-xl px-8 py-4 rounded-xl',
  },
} as const;

// Responsive variants
export const responsive = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Component utility classes
export const utils = {
  // Flex utilities
  flex: {
    items: {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    direction: {
      row: 'flex-row',
      col: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'col-reverse': 'flex-col-reverse',
    },
  },

  // Position utilities
  position: {
    static: 'static',
    relative: 'relative',
    absolute: 'absolute',
    fixed: 'fixed',
    sticky: 'sticky',
  },

  // Overflow utilities
  overflow: {
    visible: 'overflow-visible',
    hidden: 'overflow-hidden',
    clip: 'overflow-clip',
    auto: 'overflow-auto',
    scroll: 'overflow-scroll',
  },

  // Display utilities
  display: {
    none: 'hidden',
    block: 'block',
    inline: 'inline',
    inlineBlock: 'inline-block',
    flex: 'flex',
    inlineFlex: 'inline-flex',
    grid: 'grid',
    inlineGrid: 'inline-grid',
  },
} as const;
