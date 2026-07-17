/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Claude-like color palette
        'claude-bg-light': '#FFFFFF',
        'claude-bg-dark': '#1E1E1E',
        'claude-surface-light': '#F7F7F7',
        'claude-surface-dark': '#2D2D2D',
        'claude-border-light': '#E5E5E5',
        'claude-border-dark': '#404040',
        'claude-text-primary-light': '#1F1F1F',
        'claude-text-primary-dark': '#ECECEC',
        'claude-text-secondary-light': '#666666',
        'claude-text-secondary-dark': '#A0A0A0',
        'claude-accent': '#6366F1',
      },
    },
  },
  plugins: [],
}
