// Blaze Sports Intel - Typography Tokens
// Version: 1.1.0
// Updated: 2025-09-26

export const typography = {
  fonts: {
    display: '"Bebas Neue", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", "Courier New", monospace',
    accent: '"Teko", system-ui, sans-serif',
    // Additional from existing site
    heading: '"Oswald", system-ui, sans-serif',
    sports: '"Roboto Mono", monospace'
  },

  scale: {
    xs: '0.64rem',
    sm: '0.8rem',
    base: '1rem',
    lg: '1.25rem',
    xl: '1.563rem',
    '2xl': '1.953rem',
    '3xl': '2.441rem',
    '4xl': '3.052rem',
    '5xl': '3.815rem',
    '6xl': '4.768rem'
  },

  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  },

  // Sport-specific typography styles
  sportStyles: {
    baseball: {
      scoreFont: '"Roboto Mono", monospace',
      statFont: '"Inter", sans-serif',
      weight: 600
    },
    football: {
      scoreFont: '"Bebas Neue", sans-serif',
      statFont: '"Inter", sans-serif',
      weight: 700
    },
    basketball: {
      scoreFont: '"Oswald", sans-serif',
      statFont: '"Inter", sans-serif',
      weight: 500
    },
    track: {
      scoreFont: '"Teko", sans-serif',
      statFont: '"Inter", sans-serif',
      weight: 400
    }
  }
};