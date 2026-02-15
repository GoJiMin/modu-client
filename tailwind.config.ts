import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/views/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
    './src/entities/**/*.{ts,tsx}',
    './src/widgets/**/*.{ts,tsx}',
    './src/shared/ui/**/*.{ts,tsx}',
    './src/shared/components/**/*.{ts,tsx}',
    './src/shared/shadcnComponent/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '450px',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        lightBlue: '#BBE1FA',
        mediumBlue: '#3282B8',
        boldBlue: '#0F4C75',
        extraboldBlue: '#1B262C',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#000000',
            '--tw-prose-counters': '#000000',
            '--tw-prose-bullets': '#000000',
            'blockquote p:first-of-type::before': {content: 'none'},
            'blockquote p:first-of-type::after': {content: 'none'},
            maxWidth: '100%',
            blockquote: {
              fontWeight: 500,
              color: 'black',
              fontStyle: 'none',
              borderInlineStartWidth: '0.25rem',
              borderInlineStartColor: '#0F4C75',
              marginTop: '1.6rem',
              marginBottom: '1.6rem',
              paddingInlineStart: '1em',
              backgroundColor: '#F5F5F5',
              padding: '0.6rem',
              paddingLeft: '1rem',
            },
            hr: {
              marginTop: '1.8rem',
              marginBottom: '1.8rem',
            },
          },
        },
      },
      animation: {
        'fade-up': 'fade-up 150ms ease-in-out',
        'fade-in': 'fade-in 200ms ease-in',
        'fade-out': 'fade-out 200ms ease forwards',
        'search-loading': 'search-loading 1.5s infinite linear',
      },
      keyframes: {
        'fade-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(1rem)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        'fade-out': {
          '0%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(1rem)',
          },
        },
        'search-loading': {
          '0%': {transform: 'translateX(-100%)'},
          '100%': {transform: 'translateX(100%)'},
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
} satisfies Config;
