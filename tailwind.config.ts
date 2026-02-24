import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Marca Catledan (manual de marca)
        primary: {
          50: '#e8f2ef',
          100: '#d1e5df',
          200: '#a3cbbe',
          300: '#75b19e',
          400: '#47977d',
          500: '#2d6b56',
          600: '#194c3a',   // Verde Catledan (principal)
          700: '#143d2f',
          800: '#0f2e23',
          900: '#0a1f18',
          950: '#05100c',
        },
        // Acento amarillo/dorado Catledan
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbc02d',
          500: '#fab527',   // Amarillo Catledan (logo)
          600: '#e5a022',
          700: '#c78b1e',
          800: '#a8761a',
          900: '#8b6216',
          950: '#5c410f',
        },
        // Crema / fondo claro marca
        cream: '#fffaf0',
        
        // Colores de UI
        background: {
          primary: '#f8fafc',
          secondary: '#f1f5f9',
          tertiary: '#e2e8f0',
        },
        
        text: {
          primary: '#1d1d1b',    // Negro Catledan (logo negro)
          secondary: '#194c3a',  // Verde para texto secundario
          tertiary: '#64748b',
        },
        
        // Colores de Estado (alineados a marca donde aplica)
        success: {
          50: '#e8f2ef',
          500: '#194c3a',
          600: '#143d2f',
          700: '#0f2e23',
        },
        
        warning: {
          50: '#fffbeb',
          500: '#fab527',   // Amarillo Catledan
          600: '#e5a022',
          700: '#c78b1e',
        },
        
        error: {
          50: '#fef2f2',
          500: '#ef4444',    // Rojo
          600: '#dc2626',
          700: '#b91c1c',
        },
        
        // Colores adicionales para el SaaS
        ganado: {
          50: '#fef7ed',
          500: '#f97316',    // Naranja para ganado
          600: '#ea580c',
        },
        
        cultivo: {
          50: '#f0fdf4',
          500: '#84cc16',    // Verde lima para cultivos
          600: '#65a30d',
        },
        
        leche: {
          50: '#fefce8',
          500: '#eab308',
          600: '#ca8a04',
        },
        // Sobrescribir verde por defecto con paleta Catledan (todas las clases green-*)
        green: {
          50: '#e8f2ef',
          100: '#d1e5df',
          200: '#a3cbbe',
          300: '#75b19e',
          400: '#47977d',
          500: '#2d6b56',
          600: '#194c3a',   // Verde Catledan
          700: '#143d2f',
          800: '#0f2e23',
          900: '#0a1f18',
          950: '#05100c',
        },
      },
      
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-catledan)', 'Montserrat', 'system-ui', 'sans-serif'],
      },
      
      animation: {
        // Animaciones personalizadas
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'progress': 'progress 5s linear forwards',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(25, 76, 58, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(25, 76, 58, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center bottom'
          },
        },
        progress: {
          '0%': { width: '100%' },
          '100%': { width: '0%' },
        },
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      },
      
      boxShadow: {
        'glow': '0 0 20px rgba(25, 76, 58, 0.3)',
        'glow-lg': '0 0 40px rgba(25, 76, 58, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(25, 76, 58, 0.2)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

export default config
