/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo-600
          hover: '#4338CA', // Indigo-700
          light: '#EEF2FF', // Indigo-50
        },
        secondary: {
          DEFAULT: '#2563EB', // Blue-600
          hover: '#1D4ED8', // Blue-700
          light: '#EFF6FF', // Blue-50
        },
        success: {
          DEFAULT: '#10B981', // Emerald-500
          hover: '#059669', // Emerald-600
          light: '#ECFDF5', // Emerald-50
        },
        warning: {
          DEFAULT: '#F59E0B', // Amber-500
          hover: '#D97706', // Amber-600
          light: '#FFFBEB', // Amber-50
        },
        danger: {
          DEFAULT: '#EF4444', // Red-500
          hover: '#DC2626', // Red-600
          light: '#FEF2F2', // Red-50
        },
        surface: {
          DEFAULT: '#FFFFFF', // White
          dark: '#1E293B', // Slate-800
        },
        background: {
          DEFAULT: '#F8FAFC', // Slate-50
          dark: '#0F172A', // Slate-900
        },
        border: {
          DEFAULT: '#E2E8F0', // Slate-200
          dark: '#334155', // Slate-700
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'IBM Plex Sans', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}