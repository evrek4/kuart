/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: "#C9A84C",
        gold: {
          DEFAULT: "#C9A84C",
          50: "#FDFBEE",
          100: "#FBF5D5",
          200: "#F6EAAC",
          300: "#EFD97F",
          400: "#D6BB68",
          500: "#C9A84E",
          600: "#B5933A",
          700: "#8C6E26",
        },
        navy: {
          DEFAULT: "#0B1B36",
          950: "#050D1A",
          900: "#0B1B36",
          800: "#172A49",
          700: "#23395B",
          600: "#2E496D",
          500: "#3D5B84",
          100: "#EAEFF5",
          50:  "#F2F5F9",
        },
        warmbg: "#F8F8F6",
        borderlight: "#E6E7EA",
        dark: {
          DEFAULT: "#081326",
          card: "#0E1D34",
          highlight: "#132A4A",
          border: "rgba(255, 255, 255, 0.08)",
        },
        lightText: {
          primary: "#0B1933",
          secondary: "#596475",
          muted: "#707A89",
        },
        darkText: {
          primary: "#F7F8FA",
          secondary: "#B9C1CE",
          muted: "#8E99AA",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "gold-glow": "0 0 15px rgba(201, 168, 78, 0.15)",
        "gold-glow-hover": "0 0 25px rgba(201, 168, 78, 0.3)",
        "premium": "0 20px 40px -15px rgba(11, 27, 54, 0.07)",
        "premium-dark": "0 20px 40px -15px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};
