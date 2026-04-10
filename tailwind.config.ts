import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{ts,tsx}",
        "./src/components/**/*.{ts,tsx}",
        "./src/app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1280px",
            },
        },
        extend: {
            colors: {
                border: "var(--line)",
                input: "var(--line)",
                ring: "var(--accent)",
                background: "var(--bg)",
                foreground: "var(--paper)",
                
                // Keep shadcns semantic tokens mapped
                primary: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--paper)",
                },
                secondary: {
                    DEFAULT: "var(--ink)",
                    foreground: "var(--paper)",
                },
                destructive: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--paper)",
                },
                muted: {
                    DEFAULT: "var(--ink)",
                    foreground: "var(--steel)",
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--paper)",
                },
                popover: {
                    DEFAULT: "var(--bg)",
                    foreground: "var(--paper)",
                },
                card: {
                    DEFAULT: "var(--bg)",
                    foreground: "var(--paper)",
                },
                
                // Specific domain tokens
                paper: "var(--paper)",
                ink: "var(--ink)",
                steel: "var(--steel)",
                line: "var(--line)",
            },
            fontFamily: {
                display: ['"Bebas Neue"', '"Oswald"', '"DIN Condensed"', 'sans-serif'],
                sans: ['"Inter"', '"IBM Plex Sans"', 'sans-serif'],
            },
            borderRadius: {
                lg: "4px",
                md: "2px",
                sm: "0px",
            },
            fontSize: {
                'hero': ['clamp(56px, 10vw, 88px)', { lineHeight: '0.95', letterSpacing: '0.05em' }],
                'h2': ['clamp(28px, 4.5vw, 52px)', { lineHeight: '1.0', letterSpacing: '0.02em' }],
                'h3': ['clamp(22px, 2.5vw, 32px)', { lineHeight: '1.05', letterSpacing: '0.01em' }],
                'annotation': ['12px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
            },
            letterSpacing: {
                'monument': '0.05em',
            },
            backgroundImage: {
                'grain': "url('/noise.webp')",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "fade-in": {
                    from: { opacity: "0", transform: "translateY(16px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "wipe-in": {
                    from: { clipPath: "inset(100% 0 0 0)" },
                    to: { clipPath: "inset(0 0 0 0)" },
                },
                "float": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-6px)" },
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 600ms ease-out both",
                "wipe-in": "wipe-in 800ms cubic-bezier(0.16, 1, 0.3, 1) both",
                "float": "float 8s ease-in-out infinite",
            },
        },
    },
    plugins: [],
};

export default config;
