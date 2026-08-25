/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Tailwind v4: darkMode is configured via @variant in globals.css
  // No need for darkMode: 'class' here — handled by @variant dark directive
};
