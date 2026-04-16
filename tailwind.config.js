/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'why-collage': '0px 0px 4px 0px #00000012, 0px 4px 6px 0px #0000001A',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translate(-50%, 8px)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.18s ease-out both',
      },
    },
  },
  plugins: [],
}
