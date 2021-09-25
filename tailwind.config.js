module.exports = {
  mode: "jit",
  purge: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './node_modules/@zach.codes/react-calendar/dist/**/*.js'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
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
