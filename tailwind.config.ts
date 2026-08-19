import type { Config } from 'tailwindcss';

/**
 * Design system for the BPSC TRE mock test platform.
 *
 * Colours are declared as CSS custom properties in `src/index.css` (as
 * space-separated RGB channels) so the very same Tailwind class works in both
 * the light and the dark theme. The theme is switched by toggling the `dark`
 * class on <html>, driven by `src/store/themeStore.ts`.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-muted': 'rgb(var(--color-surface-muted) / <alpha-value>)',
        'surface-raised': 'rgb(var(--color-surface-raised) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        'line-strong': 'rgb(var(--color-line-strong) / <alpha-value>)',

        // Text
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--color-ink-muted) / <alpha-value>)',
        'ink-subtle': 'rgb(var(--color-ink-subtle) / <alpha-value>)',
        'ink-inverse': 'rgb(var(--color-ink-inverse) / <alpha-value>)',

        // Brand / semantic
        brand: {
          DEFAULT: 'rgb(var(--color-brand) / <alpha-value>)',
          soft: 'rgb(var(--color-brand-soft) / <alpha-value>)',
          strong: 'rgb(var(--color-brand-strong) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
          soft: 'rgb(var(--color-success-soft) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)',
          soft: 'rgb(var(--color-danger-soft) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
          soft: 'rgb(var(--color-warning-soft) / <alpha-value>)',
        },
        review: {
          DEFAULT: 'rgb(var(--color-review) / <alpha-value>)',
          soft: 'rgb(var(--color-review-soft) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--color-info) / <alpha-value>)',
          soft: 'rgb(var(--color-info-soft) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        raised: '0 4px 6px -1px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.06)',
        overlay: '0 20px 25px -5px rgb(15 23 42 / 0.16), 0 8px 10px -6px rgb(15 23 42 / 0.10)',
      },
      screens: {
        xs: '480px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 160ms ease-out',
        'slide-up': 'slide-up 180ms ease-out',
        'slide-in-right': 'slide-in-right 200ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
