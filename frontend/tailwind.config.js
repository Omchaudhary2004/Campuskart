/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ck: {
          blue: "#1e4fbf",
          blueDark: "#153a8f",
          orange: "#e85d2a",
          orangeSoft: "#f4a261",
          purple: "#6b4ea3",
          purpleSoft: "#9b7ed9",
          cream: "#faf8ff",
          ink: "#1a1f36",
        },
      },
      fontFamily: {
        display: ["DM Sans", "system-ui", "sans-serif"],
        body: ["Source Sans 3", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
