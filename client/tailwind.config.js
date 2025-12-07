/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // We will toggle it manually or via system preference, class is safer
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                dark: {
                    900: '#0f172a', // Slate 900
                    800: '#1e293b', // Slate 800
                    700: '#334155', // Slate 700
                },
                primary: {
                    DEFAULT: '#3b82f6', // Blue 500
                    hover: '#2563eb', // Blue 600
                },
                accent: {
                    DEFAULT: '#0f172a', // deep navy
                }
            }
        },
    },
    plugins: [],
}
