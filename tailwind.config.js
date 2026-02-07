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
    },
  },
  plugins: [],
}
