import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#EEF2F7',
          100: '#D4DCE8',
          200: '#A9B9D1',
          300: '#7E96BA',
          400: '#5373A3',
          500: '#4A6FA5',
          600: '#3B5998',
          700: '#2D4373',
          800: '#22345A',
          900: '#1B2A4A',
          950: '#111D33',
        },
        mint: {
          50: '#EEFBF9',
          100: '#D5F5F0',
          200: '#ABE9E1',
          300: '#72D9CC',
          400: '#4DD8CC',
          500: '#2EC4B6',
          600: '#24A399',
          700: '#1D827B',
          800: '#17665F',
          900: '#12524C',
        },
        orange: {
          50: '#FFF4ED',
          100: '#FFE6D5',
          200: '#FFD0B0',
          300: '#FFB380',
          400: '#FF8C5A',
          500: '#FF6B35',
          600: '#E8561F',
          700: '#C44518',
          800: '#9C3615',
          900: '#7C2D12',
        },
        warm: {
          50: '#FAFAF8',
          100: '#F5F3EF',
          200: '#EBE8E0',
          300: '#D5D0C5',
          400: '#B8B0A0',
        },
      },
      fontFamily: {
        sans: ['"Pretendard"', '"Noto Sans KR"', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(27, 42, 74, 0.06), 0 4px 12px rgba(27, 42, 74, 0.04)',
        'card-hover': '0 4px 12px rgba(27, 42, 74, 0.1), 0 8px 24px rgba(27, 42, 74, 0.06)',
        'nav': '0 1px 3px rgba(27, 42, 74, 0.08)',
        'button': '0 1px 2px rgba(27, 42, 74, 0.08), 0 2px 8px rgba(27, 42, 74, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
