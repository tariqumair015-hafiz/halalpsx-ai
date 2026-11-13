import { createStitches } from '@stitches/react';

export const { styled, css, globalCss, keyframes, theme, createTheme, getCssText } = createStitches({
  theme: {
    colors: {
      bgDark: '#090D16',
      cardDark: '#0F172A',
      cardHover: '#1E293B',
      borderSubtle: '#1E293B',
      borderGlow: '#10B981',
      emeraldGlow: 'rgba(16, 185, 129, 0.25)',
      amberGlow: 'rgba(245, 158, 11, 0.25)',
      roseGlow: 'rgba(244, 63, 94, 0.25)',
      cyanGlow: 'rgba(56, 189, 248, 0.25)',
    },
    shadows: {
      neonEmerald: '0 0 20px rgba(16, 185, 129, 0.25)',
      neonAmber: '0 0 20px rgba(245, 158, 11, 0.25)',
      neonRose: '0 0 20px rgba(244, 63, 94, 0.25)',
      glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    },
    radii: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      full: '9999px',
    },
  },
});

export const pulseGlow = keyframes({
  '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
  '50%': { opacity: '1', transform: 'scale(1.05)' },
});

export const shimmer = keyframes({
  '0%': { backgroundPosition: '-200% 0' },
  '100%': { backgroundPosition: '200% 0' },
});

