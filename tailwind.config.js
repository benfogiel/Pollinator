/** @type {import('tailwindcss').Config} */
/* global module */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {},
        colors: {
            "const-white": "#FFFFFF",
            "const-black": "#000000",
            "pol-bg-0": "#191919",
            "pol-bg-1": "#313131",
            "pol-border-1": "#606060",
            "pol-ultra-red": "#FF0000",
            "pol-text-1": "#FFFFFF",
            "pol-text-2": "#000000",
        },
    },
    plugins: [],
};
