/** @type {import('tailwindcss').Config} */
/* export default {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}

 */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  prefix: "tw-",
  safelist: ["tw-ml-[-12px]", "tw-ml-2"],
};