/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Poshmark-inspired colors
        poshmark: {
          pink: '#E91E63', // Deep pink like Poshmark
          'pink-light': '#F8BBD9', // Light pink
          'pink-dark': '#C2185B', // Darker pink
        },
        // Keep some original colors but make them more accessible
        coral: '#E91E63', // Match Poshmark pink
        teal: '#00BCD4', // More accessible teal
        lavender: '#E1BEE7', // Lighter lavender
        mint: '#C8E6C9', // Lighter mint
        peach: '#FFCCBC', // Lighter peach
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
