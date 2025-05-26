/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // High contrast colors for accessibility
        'high-contrast-text': '#000',
        'high-contrast-bg': '#fff',
        'focus-ring': '#2563eb',
      },
      spacing: {
        // Larger touch targets for accessibility
        'touch-target': '44px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
