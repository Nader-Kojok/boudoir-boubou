import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        // Palette Le Boudoir du Boubou - Beige/Nude/Ocre/Vert d'eau
        boudoir: {
          beige: {
            50: '#faf9f7',   // Beige très clair
            100: '#f5f4f0', // Nude clair
            200: '#f0ede6', // Input nude
            300: '#ebe6dc', // Beige moyen
            400: '#e1d9cc', // Beige border
            500: '#d6ccbb', // Nude rosé
            600: '#a6906f', // Terre de Sienne
            700: '#8b7355', // Beige foncé
            800: '#6b5a47', // Muted foreground
            900: '#3d332a', // Brun foncé
          },
          ocre: {
            400: '#c4914d',  // Ocre clair
            500: '#a67c3a',  // Ocre principal
            600: '#8b6830',  // Ocre foncé
          },
          'vert-eau': {
            400: '#b8d4d1', // Vert d'eau clair
            500: '#9bc5c0', // Vert d'eau principal
            600: '#7eb6b0', // Vert d'eau foncé
          }
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config