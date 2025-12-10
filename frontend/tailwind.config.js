/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                game: {
                    dark: '#0F1923', // Valorant Dark Navy
                    red: '#FF4655',  // Valorant Red
                    yellow: '#FCE300', // Cyberpunk Yellow
                    white: '#FFFFFF',
                    gray: '#B0B0B0'
                },
                ribbit: {
                    dark: '#0D0D0D', // Cinematic Black
                    white: '#FFFFFF',
                    gray: '#9CA3AF',
                    purple: '#7B4FF1', // Neon Purple Accent
                    teal: '#00E0B8'    // Teal Accent
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'], // Tech feel
            },
        },
    },
    plugins: [],
}
