module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#3b82f6',
          indigo: '#4f46e5',
          purple: '#6d28d9',
          rose: '#fb7185',
          emerald: '#059669',
          teal: '#0d9488',
          cyan: '#06b6d4',
          orange: '#f97316'
        }
      }
    },
  },
  plugins: [],
};
