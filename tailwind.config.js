/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luminexs: {
          blue: '#0F3460',
          navy: '#16213E',
          yellow: '#FFB800',
          orange: '#FF5722',
          electric: '#00D2FF',
          dark: '#1A1A24'
        },
        flipkart: {
          blue: '#2874F0',
          yellow: '#FFE500',
          green: '#388E3C',
          lightGrey: '#F1F3F6'
        },
        amazon: {
          orange: '#FF9900',
          navy: '#131921',
          lightNavy: '#232F3E',
          yellow: '#F3A847'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
