import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './config/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '20px',
        sm: '24px',
        lg: '40px',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          2: 'hsl(var(--surface-2))',
          muted: 'hsl(var(--surface-muted))',
        },
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
          muted: 'hsl(var(--foreground-muted))',
          subtle: 'hsl(var(--foreground-subtle))',
        },
        border: {
          DEFAULT: 'hsl(var(--border))',
          strong: 'hsl(var(--border-strong))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          soft: 'hsl(var(--accent-soft))',
          muted: 'hsl(var(--accent-muted))',
        },
        free: {
          DEFAULT: 'hsl(var(--free))',
          soft: 'hsl(var(--free-soft))',
        },
        shop: {
          DEFAULT: 'hsl(var(--shop))',
          soft: 'hsl(var(--shop-soft))',
        },
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-noto-serif-kr)', 'var(--font-crimson)', 'serif'],
      },
      fontSize: {
        display: ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.025em' }],
        h1: ['1.75rem', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
        h2: ['1.375rem', { lineHeight: '1.35', letterSpacing: '-0.015em' }],
        h3: ['1.125rem', { lineHeight: '1.4' }],
        'h3-plus': ['1.25rem', { lineHeight: '1.35' }],
        body: ['1rem', { lineHeight: '1.75' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.8' }],
        meta: ['0.8125rem', { lineHeight: '1.55' }],
        caption: ['0.75rem', { lineHeight: '1.4' }],
      },
      maxWidth: {
        content: '680px',
        list: '1080px',
        wide: '1280px',
        card: '360px',
      },
      spacing: {
        'section-y': '72px',
        'card-gap': '12px',
      },
      borderRadius: {
        lg: '10px',
        md: '8px',
        sm: '6px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        elevated: 'var(--shadow-elevated)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
