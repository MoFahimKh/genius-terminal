import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(260.77deg 100% 5.1%)',
        default: '#0D0D0E',
        card: '#121212',
        accent: '#022D92',
        muted: '#727272',
        'row-hover': 'hsl(256.6deg 51.65% 17.84%)',
      },
      borderRadius: {
        default: '8px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
