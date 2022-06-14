/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        darkpurple: "#371B58",
        purple: "#4C3575",
        lightpurple: "#7858A6",
        graypurple: "#5B4B8A",
      },
    },
  },
  plugins: [],
};
