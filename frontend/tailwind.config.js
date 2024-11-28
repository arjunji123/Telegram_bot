/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      height: {
        screen: '100vh', // Full viewport height
      },
      fontFamily: {
        Inter: ["Inter", "sans-serif"], // Corrected syntax for font-family
      },
    },
  },
  plugins: [],
};
