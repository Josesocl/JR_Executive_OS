/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy:    '#1a3a5c',
          blue:    '#185FA5',
          gold:    '#b8860b',
          'gold-light': '#f5e6b0',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f7f6f3',
          tertiary: '#f0ede8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}
