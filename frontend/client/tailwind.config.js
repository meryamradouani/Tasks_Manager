export default {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}", // Adjust based on your project structure
    ],
    theme: {
      extend: {
        fontFamily: {
          display: ['Poppins', 'sans-serif'],
        },
        colors: {
          primary: '#1368EC',
        },
        screens: {
          '3xl': '1920px',
        },
      },
    },
    plugins: [],
  };