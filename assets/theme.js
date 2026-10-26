/* ============================================================
   Eat For Less — Tailwind theme
   Brand accent: #A4C516
   ============================================================ */
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: "#A4C516",
        "brand-bright": "#B9DE2A",
        "brand-dark": "#8CAA10",
        "brand-deep": "#52680D",
        "brand-soft": "#F1F8D6",
        "brand-mist": "#F8FBEC",
        ink: "#0E1A09",
        "ink-2": "#17240F",
        "ink-soft": "#3D4A33",
        muted: "#5D6855",
        line: "#E4EAD7",
        surface: "#FBFCF7",
        "surface-2": "#F4F7EC",
        "surface-3": "#EDF2E2",
        white: "#FFFFFF",
        error: "#BA1A1A",
        "error-soft": "#FFDAD6"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"]
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.75rem"
      },
      maxWidth: {
        shell: "1180px"
      },
      boxShadow: {
        soft: "0 1px 2px rgba(14,26,9,.04), 0 12px 30px rgba(14,26,9,.05)",
        lift: "0 2px 4px rgba(14,26,9,.04), 0 24px 50px rgba(14,26,9,.10)",
        lime: "0 12px 30px -10px rgba(164,197,22,.65)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(-1deg)" },
          "50%": { transform: "translateY(-14px) rotate(1deg)" }
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(164,197,22,.45)" },
          "70%": { boxShadow: "0 0 0 10px rgba(164,197,22,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(164,197,22,0)" }
        }
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(.4,0,.6,1) infinite"
      }
    }
  }
};
