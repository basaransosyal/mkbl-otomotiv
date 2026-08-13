/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#080D1A',
          darker: '#040710',
          card: '#10172A',
          border: '#1E293B',
          blue: '#2563EB',
          lightBlue: '#3B82F6',
          cyan: '#60A5FA',
          sky: '#38BDF8',
          accent: '#2563EB',
          text: '#F8FAFC',
          muted: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'blue-gradient': 'linear-gradient(135deg, #2563EB, #3B82F6, #60A5FA)',
        'blue-glow': 'radial-gradient(circle at center, rgba(37, 99, 235, 0.25) 0%, transparent 70%)',
      }
    },
  },
  plugins: [],
}
