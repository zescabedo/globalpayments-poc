/**
 * Global Payments Design System Tokens
 * 
 * This file contains all design tokens from the Global Payments Storybook
 * aligned with Sitecore XM Cloud and ContentSDK patterns.
 * 
 * Reference: https://design.globalpayments.com
 */

/**
 * Typography Tokens
 * Based on Global Payments Typography System
 */
export const typography = {
  display: {
    xxl: {
      fontSize: '9.0rem',
      lineHeight: '9.0rem',
      className: 'display-xxl',
    },
    xl: {
      fontSize: '6.4rem',
      lineHeight: '7.2rem',
      className: 'display-xl',
    },
    lg: {
      fontSize: '4.8rem',
      lineHeight: '6.0rem',
      className: 'display-lg',
    },
    md: {
      fontSize: '3.2rem',
      lineHeight: '4.0rem',
      className: 'display-md',
    },
  },
  title: {
    sm: {
      fontSize: '2.4rem',
      lineHeight: '3.2rem',
      className: 'title-sm',
    },
    xs: {
      fontSize: '2.0rem',
      lineHeight: '2.8rem',
      className: 'title-xs',
    },
    xxs: {
      fontSize: '1.6rem',
      lineHeight: '2.4rem',
      className: 'title-xxs',
    },
  },
  body: {
    md: {
      fontSize: '2.0rem',
      lineHeight: '3.2rem',
      className: 'body-md',
    },
    sm: {
      fontSize: '1.6rem',
      lineHeight: '2.4rem',
      className: 'body-sm',
    },
    xs: {
      fontSize: '1.2rem',
      lineHeight: '1.6rem',
      className: 'body-xs-source',
    },
    xxs: {
      fontSize: '0.8rem',
      lineHeight: '1.2rem',
      className: 'body-xxs-legal',
    },
  },
  label: {
    xxl: {
      fontSize: '7.2rem',
      lineHeight: '7.2rem',
      className: 'label-xxl',
    },
    xl: {
      fontSize: '5.6rem',
      lineHeight: '5.6rem',
      className: 'label-xl',
    },
    lg: {
      fontSize: '4.0rem',
      lineHeight: '4.0rem',
      className: 'label-lg',
    },
    md: {
      fontSize: '2.4rem',
      lineHeight: '3.6rem',
      className: 'label-md',
    },
    sm: {
      fontSize: '1.6rem',
      lineHeight: '2.4rem',
      className: 'label-sm-form',
    },
    xs: {
      fontSize: '1.2rem',
      lineHeight: '2.4rem',
      className: 'label-xs-form',
    },
  },
} as const;

/**
 * Color Tokens
 * Based on Global Payments Color System
 */
export const colors = {
  // Primary Colors
  white: {
    value: '#FFFFFF',
    variable: '--gpn-theme-white-255',
  },
  blue500: {
    value: '#262AFF',
    variable: '--gpn-theme-blue-500',
    description: 'Primary brand blue (Base)',
  },
  
  // Secondary Colors
  blue600: {
    value: '#1B1EC6',
    variable: '--gpn-theme-blue-600',
    description: 'Darker brand blue',
  },
  black950: {
    value: '#0C0C0C',
    variable: '--gpn-theme-black-950',
    description: 'Near-black for text (Off-Black)',
  },
  
  // Tertiary Colors
  blue300: {
    value: '#1CABFF',
    variable: '--gpn-theme-blue-300',
    description: 'Light accent blue (Pulse)',
  },
  yellow310: {
    value: '#FFCC00',
    variable: '--gpn-theme-yellow-310',
    description: 'Bright yellow accent (Sunshine)',
  },
  orange200: {
    value: '#FDA052',
    variable: '--gpn-theme-orange-200',
    description: 'Orange accent color (Creamsicle)',
  },
  red200: {
    value: '#F4364C',
    variable: '--gpn-theme-red-200',
    description: 'Error and alert red (Raspberry)',
  },
  purple400: {
    value: '#87179D',
    variable: '--gpn-theme-purple-400',
    description: 'Purple accent (Grape)',
  },
  green210: {
    value: '#00C75D',
    variable: '--gpn-theme-green-210',
    description: 'Success state green',
  },
  
  // Neutral Colors (Grey Scale)
  grey110: {
    value: '#F8F8F8',
    variable: '--gpn-theme-grey-110',
    description: 'Lightest grey (Faint)',
  },
  grey120: {
    value: '#F4F4F4',
    variable: '--gpn-theme-grey-120',
    description: 'Very light grey (Subtle)',
  },
  grey200: {
    value: '#EEEEEE',
    variable: '--gpn-theme-grey-200',
    description: 'Light grey',
  },
  grey300: {
    value: '#DDDDDD',
    variable: '--gpn-theme-grey-300',
    description: 'Medium-light grey',
  },
  grey400: {
    value: '#C4C4C4',
    variable: '--gpn-theme-grey-400',
    description: 'Medium grey',
  },
  grey500: {
    value: '#909090',
    variable: '--gpn-theme-grey-500',
    description: 'Medium-dark grey',
  },
  grey600: {
    value: '#595959',
    variable: '--gpn-theme-grey-600',
    description: 'Dark grey',
  },
  
  // Theme Colors (Semantic)
  base: {
    value: '#262AFF',
    variable: '--gpn-theme-base',
    description: 'Primary theme color',
  },
  dark: {
    value: '#1B1EC6',
    variable: '--gpn-theme-dark',
    description: 'Dark theme color',
  },
  light: {
    value: '#DDF2FF',
    variable: '--gpn-theme-light',
    description: 'Light accent (Bright)',
  },
  black: {
    value: '#000000',
    variable: '--gpn-theme-black',
    description: 'True black',
  },
  
  // Gradients
  gradientHorizon: {
    value: 'linear-gradient(to right, #1CABFF, #262AFF)',
    variable: '--gpn-theme-gradient-horizon',
    description: 'Blue 300 to Blue 500',
  },
  gradientDeep: {
    value: 'linear-gradient(to right, #262AFF, #1B1EC6)',
    variable: '--gpn-theme-gradient-deep',
    description: 'Blue 500 to Blue 600',
  },
  gradientLinear: {
    value: 'linear-gradient(to bottom, #F8F8F8, #FFFFFF)',
    variable: '--gpn-theme-linear',
    description: 'Faint to White',
  },
} as const;

/**
 * Spacing Tokens
 * Based on Global Payments Spacing System
 * Base unit: 0.8rem (8px)
 */
export const spacing = {
  // Responsive Spacing Tokens
  responsive: {
    macro: {
      desktop: '14.4rem', // 144px
      tablet: '8rem',     // 80px
      mobile: '6.4rem',   // 64px
    },
    xxxl: {
      desktop: '8rem',    // 80px
      tablet: '7.2rem',   // 72px
      mobile: '6.4rem',   // 64px
    },
    xxl: {
      desktop: '6.4rem',  // 64px
      tablet: '5.6rem',   // 56px
      mobile: '4.8rem',   // 48px
    },
    xl: {
      desktop: '4.8rem',  // 48px
      tablet: '4rem',     // 40px
      mobile: '4rem',     // 40px
    },
    lg: {
      desktop: '4rem',    // 40px
      tablet: '4rem',     // 40px
      mobile: '3.2rem',   // 32px
    },
    md: {
      desktop: '3.2rem',  // 32px
      tablet: '2.4rem',   // 24px
      mobile: '2.4rem',   // 24px
    },
    sm: {
      desktop: '2.4rem',  // 24px
      tablet: '2.4rem',   // 24px
      mobile: '2.4rem',   // 24px
    },
    xs: {
      desktop: '1.6rem',  // 16px
      tablet: '1.6rem',   // 16px
      mobile: '1.6rem',   // 16px
    },
    xxs: {
      desktop: '0.8rem',  // 8px
      tablet: '0.8rem',   // 8px
      mobile: '0.8rem',   // 8px
    },
    xxxx: {
      desktop: '0.4rem',  // 4px
      tablet: '0.4rem',   // 4px
      mobile: '0.4rem',   // 4px
    },
    micro: {
      desktop: '0.2rem',  // 2px
      tablet: '0.2rem',   // 2px
      mobile: '0.2rem',   // 2px
    },
  },
  
  // Bootstrap Spacers (Fixed values)
  bootstrap: {
    0: '0',
    1: '0.8rem',   // 8px
    2: '1.6rem',   // 16px
    3: '2.4rem',   // 24px
    4: '3.2rem',   // 32px
    5: '4rem',     // 40px
    6: '4.8rem',   // 48px
    7: '5.6rem',   // 56px
    8: '6.4rem',   // 64px
    9: '7.2rem',   // 72px
    10: '8rem',    // 80px
    11: '8.8rem',  // 88px
    12: '9.6rem',  // 96px
    16: '12.8rem', // 128px
    18: '14.4rem', // 144px
    20: '16rem',   // 160px
  },
} as const;

/**
 * Button Variants
 * Based on Global Payments Button System
 */
export const buttonVariants = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
  outline: 'outline',
  ghost: 'ghost',
  link: 'link',
} as const;

export type ButtonVariant = typeof buttonVariants[keyof typeof buttonVariants];

/**
 * Breakpoints
 * Standard responsive breakpoints
 */
export const breakpoints = {
  mobile: '0px',
  tablet: '768px',
  desktop: '1024px',
  large: '1366px',
} as const;








