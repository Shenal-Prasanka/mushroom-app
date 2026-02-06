/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#10b981',
                secondary: '#3b82f6',
                dark: '#1f2937',
                darker: '#000000', // Pure black for maximum darkness
                light: '#927a7aff'  // Changed to pure white for lighter main content
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
