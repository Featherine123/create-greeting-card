/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF6EE',
        'paper-dark': '#F1E9DA',
        ink: '#4A3F35',
        'ink-soft': '#8A7A6A',
        'accent-rose': '#D96C6C',
        'accent-kraft': '#C9A87C',
        'accent-sky': '#A9C6D9',
        'accent-sage': '#8FA98A',
        gold: '#D4A94E',
        danger: '#C0392B',
      },
      fontFamily: {
        script: ['"Dancing Script"', 'cursive'],
        body: ['"Be Vietnam Pro"', 'Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px rgba(74,63,53,0.12)',
        lift: '0 12px 32px rgba(74,63,53,0.18)',
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
}