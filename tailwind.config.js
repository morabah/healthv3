/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx,css}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      colors: {
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        blue: {
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        red: {
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        green: {
          500: '#22c55e',
          600: '#16a34a',
        }
      }
    },
  },
  plugins: [],
}
