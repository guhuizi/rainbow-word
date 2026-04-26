/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rainbow-blue': '#6BBFFF',
        'rainbow-green': '#7ED957',
        'rainbow-orange': '#FFB347',
        'rainbow-pink': '#FF6B9D',
        'rainbow-purple': '#B066FF',
        'rainbow-yellow': '#FFE066',
        'bg-cream': '#FDF6E3',
      },
      fontFamily: {
        'rounded': ['Comic Sans MS', ' cursive', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
