// frontend/acytel_frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'background': '#101010',
        'surface': '#1A1C25',
        // Directive: Accent color refined to match the blueprint's deep blue.
        'accent': '#313B6B', 
        'muted': '#8E92A4',
        'primary-text': '#FFFFFF',
        'secondary-text': '#A0AEC0',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}