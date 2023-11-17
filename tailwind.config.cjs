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
                main: 'rgba(7, 16, 27, 1)',
                textMain: '#181818',
                lightBg: '#F9F9F9',
                lightSecond: '#767F8D',
                lightLineSecond: '#E6E7E8',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            boxShadow: {
                send: '0px 0px 20px 0px #0000000D',
                popover: '0px 0px 16px 0px #65778633',
            },
        },
        screens: {
            sm: '640px',
            md: '990px',
            lg: '1265px',
        },
    },
    plugins: [require('@tailwindcss/forms')],
};
