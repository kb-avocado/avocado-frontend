/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-avocado-600)',

        avocado: {
          50: 'var(--color-avocado-50)',
          100: 'var(--color-avocado-100)',
          300: 'var(--color-avocado-300)',
          600: 'var(--color-avocado-600)',
          900: 'var(--color-avocado-900)'
        },

        progress: {
          track: 'var(--color-progress-track)',
          value: 'var(--color-progress-value)'
        },
        muted: 'var(--color-text-muted)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)'
      }
    }
  },

  plugins: []
}
