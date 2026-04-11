/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fdf4ff',
                    100: '#fae8ff',
                    200: '#f5d0fe',
                    300: '#f0abfc',
                    400: '#e879f9',
                    500: '#d946ef',
                    600: '#c026d3',
                    700: '#a21caf',
                    800: '#86198f',
                    900: '#701a75',
                },
                luxury: {
                    'gold': '#DAA520',
                    'gold-light': '#FFD700',
                    'gold-dark': '#B8860B',
                    'champagne': '#F4E4C1',
                    'silver': '#C0C0C0',
                    'rose-gold': '#E0BFB8',
                    'platinum': '#E5E4E2',
                },
                neutral: {
                    950: '#0a0a0a',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Playfair Display', 'serif'],
                elegant: ['Cormorant Garamond', 'serif'],
                heading: ['Montserrat', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-down': 'slideDown 0.5s ease-out',
                'shimmer': 'shimmer 3s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite',
                'spin-slow': 'spin 3s linear infinite',
                'pulse-slow': 'pulse 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(218, 165, 32, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(218, 165, 32, 0.6)' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-luxury': 'linear-gradient(135deg, #DAA520 0%, #F4E4C1 50%, #DAA520 100%)',
                'gradient-dark': 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
            },
            boxShadow: {
                'luxury': '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(218, 165, 32, 0.1)',
                'luxury-lg': '0 30px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(218, 165, 32, 0.15)',
                'gold': '0 10px 30px rgba(218, 165, 32, 0.3)',
                'gold-lg': '0 20px 50px rgba(218, 165, 32, 0.4)',
            },
            backdropBlur: {
                'xs': '2px',
            },
        },
    },
    plugins: [],
};
