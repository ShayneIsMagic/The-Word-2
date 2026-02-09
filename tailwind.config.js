/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // LDS Scripture Study color scheme
        'lds': {
          50: '#e8f4fc',    // Light blue tint
          100: '#d0e7f8',
          200: '#a0d0f0',
          300: '#70b9e7',
          400: '#40a2de',
          500: '#008cd5',
          600: '#0077c0',   // Primary LDS brand blue
          700: '#0062a8',
          800: '#004d90',
          900: '#003366',   // Darker blue
        },
        'lds-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        'greek': ['Noto Sans', 'system-ui', 'sans-serif'],
        'hebrew': ['Noto Sans Hebrew', 'system-ui', 'sans-serif'],
        'scripture': ['Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
