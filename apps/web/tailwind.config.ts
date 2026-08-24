const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#D4AF37", // Premium Gold
          foreground: "#0B0B0B",
          50: "#FAF7EC",
          100: "#F3EED2",
          200: "#E7DC9F",
          300: "#DBCA6C",
          400: "#CFB839",
          500: "#D4AF37",
          600: "#A88B27",
          700: "#7C671D",
          800: "#514313",
          900: "#2B240A",
        },
        dark: {
          DEFAULT: "#0B0B0B",
          card: "rgba(255, 255, 255, 0.03)",
          border: "rgba(255, 255, 255, 0.06)",
        }
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
        "gold-glow": "0 0 15px rgba(212, 175, 55, 0.12)",
        "gold-glow-hover": "0 0 25px rgba(212, 175, 55, 0.3)",
      },
      dropShadow: {
        "gold": "0 0 10px rgba(212, 175, 55, 0.25)",
      }
    },
  },
  plugins: [],
};
export default config;
