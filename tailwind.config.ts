import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3182f6',
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#3182f6',
          600: '#2558d9',
          700: '#1b47b8',
          800: '#163a96',
          900: '#132f7a',
        },
        background: '#f8f6f1',
        foreground: '#2d3748',
        muted: '#718096',
        surface: '#ffffff',
        border: '#e2e8f0',
        sidebar: '#1a2332',
        'sidebar-hover': '#243044',
        'sidebar-active': '#2c3e50',
        'primary-light': '#3182ce',
        'primary-dark': '#1a365d',
      },
      fontFamily: {
        sans: ['var(--font-noto-sans-kr)', 'sans-serif'],
        outfit: ['var(--font-outfit)', 'sans-serif'],
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeInUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
