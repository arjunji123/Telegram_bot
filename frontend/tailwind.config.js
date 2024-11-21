/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      height: {
        screen: '100vh', // Full viewport height
      },
      fontFamily: {
        eina: ['"Eina"', 'sans-serif'], // Add your custom font
      },
    },
  },
  plugins: [],
};
