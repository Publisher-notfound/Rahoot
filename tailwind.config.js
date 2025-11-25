/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ff9900",
        secondary: "#1a140b",
      },
    },
  },
  safelist: [
    "grid-cols-4", 
    "grid-cols-3", 
    "grid-cols-2",
    "bg-orange-600",
    "opacity-70",
    "opacity-60",
    {pattern: /bg-(red|blue|yellow|green|orange|purple|teal|gray|black)-(50|100|200|300|400|500|600|700|800|900)/},
    {pattern: /text-(red|blue|yellow|green|orange|purple|teal|gray|black|white)-(50|100|200|300|400|500|600|700|800|900)/},
    {pattern: /border-(red|blue|yellow|green|orange|purple|teal|gray|black)-(50|100|200|300|400|500|600|700|800|900)/},
    {pattern: /from-(red|blue|yellow|green|orange|purple|teal|gray|black)-(50|100|200|300|400|500|600|700|800|900)/},
    {pattern: /via-(red|blue|yellow|green|orange|purple|teal|gray|black)-(50|100|200|300|400|500|600|700|800|900)/},
    {pattern: /to-(red|blue|yellow|green|orange|purple|teal|gray|black)-(50|100|200|300|400|500|600|700|800|900)/},
    "bg-gradient-to-br",
    "backdrop-blur-sm",
    "bg-white/10",
    "bg-white/5",
    "bg-black/20",
    "bg-black/40",
    "bg-black/50",
    "text-white/80",
    "text-white/70",
    "text-white/90",
    "border-white/20",
    "border-white/30"
  ],
  plugins: [],
}
