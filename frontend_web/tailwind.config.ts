import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#2E7D32',
          orange: '#FF9800',
          ink: '#212121',
          surface: '#F8F9FA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        app: '16px',
      },
      boxShadow: {
        soft: '0 16px 40px rgb(33 33 33 / 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;

