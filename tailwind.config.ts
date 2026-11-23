import type { Config } from "tailwindcss";

/** A theme colour from globals.css, with opacity support (e.g. bg-accent/15). */
const token = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        surface: token("surface"),
        ink: token("ink"),
        muted: token("muted"),
        line: token("line"),
        field: token("field"),
        accent: token("accent"),
        "on-accent": token("on-accent"),
      },
    },
  },
  plugins: [],
};

export default config;