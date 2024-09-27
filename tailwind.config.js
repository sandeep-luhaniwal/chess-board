/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: "16px",
        },
      },
      fontFamily: {
        'space-gortesk': ["Space Grotesk", "sans-serif"],
        'poppins': ["Poppins", "sans-serif"],
      },
      fontSize: {
        'custum-base': '22px',
        'custum-md': '26px',
        'custum-2md': '51px',
        'custum-lg': '67px',
        'custum-xl': '100px',
        'custum-2xl': '135px',
      },
      colors: {
        'dark-grey': "#313131",
        'light-black': '#f5f5f5',
        'red': "#FF0000",
        'antique-brass': "#B89365",
        'rosy-pink': "#EF767A",
        'pacific-blue': "#00AFE1",
        'alto': "#d9d9d9",
        'bright-cerulean': '#02AFE0',
        'dark-black': "#222222",
      },
      backgroundImage: {
        'dark-gray': "linear-gradient(180deg, #000000 0%, #393939 100%)",
        'light-gray': "linear-gradient(#292929,#292929)",
      },
      lineHeight: {
        60: "60%",
        91: "91%",
        107: "107.4%",
        115: "115.4%",
        120: "120%",
        125: "125%",
        127: "127.61%",
        130: "130%",
        145: "145%",
        158: "158%",
        170: "170%",
        200: "200%",
      },
      animation: {
        'slide-partner': 'slideX 20s linear infinite',
        dot: 'dot 2s infinite linear',
        'dot-white': 'dot-white 2s infinite linear',
        'spin-slow': 'spin 10s linear infinite',
      },
      keyframes: {
        slideX: {
          '100%': { transform: 'translatex(-100%)' },
        },
        dot: {
          '0%': {
            boxShadow: '0 0 0 0 #ff000040',
          },
          '70%': {
            boxShadow: '0 0 0 8px #ff000000',
          },
          '100%': {
            boxShadow: '0 0 0 0 #ff000000',
          },
        },
        'dot-white': {
          '0%': {
            boxShadow: '0 0 0 0 #ffffff50',
          },
          '70%': {
            boxShadow: '0 0 0 8px #ffffff00',
          },
          '100%': {
            boxShadow: '0 0 0 0 #ffffff00',
          },
        },
      },
      boxShadow: {
        "black-lose": "0px 2px 10px 0px #00000029",
        "black-project": "0px 2px 30px 4px #0000001A",
        "black-project-sm": "0px 2px 15px 4px #0000001A",
        "black-dark": "0px 7px 8px rgba(0,0,0,.31),inset 0 2px 1px rgba(255,255,255,.5)",
        "slider-button":"0px 4px 4px 0px #00000036",
      },
      screens: {
        "custom-sm": "360px",
        "custom-xl": "1380px",
        "custom-2xl": "2400px"
      },
      borderRadius: {
        36:"36px"
      }
    },
  },
  plugins: [],
}