module.exports = {
  mode: "jit",
  purge: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './node_modules/@zach.codes/react-calendar/dist/**/*.js'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;"
      },
      colors: {
        secondary: "#6B7280"
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
