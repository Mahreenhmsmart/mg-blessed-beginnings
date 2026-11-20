/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Every colour resolves through a CSS variable defined in
      // src/styles/theme.css. The literal fallback inside each var() is the
      // default palette, so the app still renders correctly if theme.css is
      // ever emptied or deleted. The channel-triplet form is what enables
      // opacity modifiers (bg-primary/10, text-muted-foreground/70).
      colors: {
        background: 'rgb(var(--background, 10 12 20) / <alpha-value>)',
        foreground: 'rgb(var(--foreground, 255 255 255) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface, 22 26 40) / <alpha-value>)',
          elevated: 'rgb(var(--surface-elevated, 30 36 54) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--card, 26 31 48) / <alpha-value>)',
          hover: 'rgb(var(--card-hover, 34 40 58) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground, 255 255 255) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted, 100 110 140) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground, 212 219 232) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary, 157 106 255) / <alpha-value>)',
          hover: 'rgb(var(--primary-hover, 183 148 255) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground, 255 255 255) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary, 28 32 50) / <alpha-value>)',
          hover: 'rgb(var(--secondary-hover, 38 44 64) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground, 255 255 255) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent, 0 212 245) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover, 51 229 255) / <alpha-value>)',
          foreground: 'rgb(var(--accent-foreground, 8 12 24) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive, 255 85 85) / <alpha-value>)',
          foreground: 'rgb(var(--destructive-foreground, 255 255 255) / <alpha-value>)',
        },
        success: 'rgb(var(--success, 52 214 107) / <alpha-value>)',
        warning: 'rgb(var(--warning, 255 170 68) / <alpha-value>)',
        error: 'rgb(var(--error, 255 85 85) / <alpha-value>)',
        info: 'rgb(var(--info, 77 159 255) / <alpha-value>)',
        cyan: 'rgb(var(--cyan, 0 212 245) / <alpha-value>)',
        blue: 'rgb(var(--blue, 77 159 255) / <alpha-value>)',
        gold: 'rgb(var(--gold, 255 170 68) / <alpha-value>)',
        text: {
          primary: 'rgb(var(--text-primary, 255 255 255) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary, 218 225 236) / <alpha-value>)',
          muted: 'rgb(var(--text-muted, 168 180 200) / <alpha-value>)',
        },
        border: 'rgb(var(--border, 58 66 96) / <alpha-value>)',
        input: 'rgb(var(--input, 58 66 96) / <alpha-value>)',
        ring: 'rgb(var(--ring, 157 106 255) / <alpha-value>)',
      },
      // Radius derives from radius tokens for consistent rounding
      borderRadius: {
        sm: 'var(--radius-sm, 0.25rem)',
        md: 'var(--radius-md, 0.375rem)',
        lg: 'var(--radius-lg, 0.5rem)',
        xl: 'var(--radius-xl, 0.75rem)',
        '2xl': 'var(--radius-2xl, 1rem)',
        full: 'var(--radius-full, 9999px)',
      },
      // Shadow tokens mapped to CSS variables
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        glow: 'var(--shadow-glow)',
        'glow-sm': 'var(--shadow-glow-sm)',
        'glow-primary': 'var(--shadow-glow-primary)',
        'glow-accent': 'var(--shadow-glow-accent)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Space Grotesk', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontWeight: {
        light: 'var(--font-weight-light, 300)',
        normal: 'var(--font-weight-normal, 400)',
        medium: 'var(--font-weight-medium, 500)',
        semibold: 'var(--font-weight-semibold, 600)',
        bold: 'var(--font-weight-bold, 700)',
        extrabold: 'var(--font-weight-extrabold, 800)',
        black: 'var(--font-weight-black, 900)',
      },
      fontSize: {
        xs: ['var(--text-xs)', { lineHeight: '1rem' }],
        sm: ['var(--text-sm)', { lineHeight: '1.25rem' }],
        base: ['var(--text-base)', { lineHeight: '1.5rem' }],
        lg: ['var(--text-lg)', { lineHeight: '1.75rem' }],
        xl: ['var(--text-xl)', { lineHeight: '1.75rem' }],
        '2xl': ['var(--text-2xl)', { lineHeight: '2rem' }],
        '3xl': ['var(--text-3xl)', { lineHeight: '2.25rem' }],
        '4xl': ['var(--text-4xl)', { lineHeight: '2.5rem' }],
      },
      spacing: {
        'xs': 'var(--spacing-xs, 0.25rem)',
        'sm': 'var(--spacing-sm, 0.5rem)',
        'md': 'var(--spacing-md, 1rem)',
        'lg': 'var(--spacing-lg, 1.5rem)',
        'xl': 'var(--spacing-xl, 2rem)',
        '2xl': 'var(--spacing-2xl, 3rem)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-brand': 'var(--gradient-brand)',
        'gradient-cool': 'var(--gradient-cool)',
        'gradient-warm': 'var(--gradient-warm)',
        'gradient-signature': 'var(--gradient-signature)',
        'gradient-page-bg': 'var(--gradient-page-bg)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-card': 'var(--gradient-card)',
        'gradient-premium': 'var(--gradient-premium)',
        'gradient-gold': 'var(--gradient-gold)',
        'gradient-cta': 'var(--gradient-cta)',
        'gradient-feature': 'var(--gradient-feature)',
      },
    },
  },
  plugins: [],
}
