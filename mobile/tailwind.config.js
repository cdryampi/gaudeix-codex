/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand Colors (from /UX/mobile/ designs)
        primary: '#3E9124', // Verde (naturaleza/hojas del logo)
        secondary: '#E97B1C', // Naranja (curva principal del logo)
        accent: '#F6B324', // Amarillo (castillo/sol del logo)
        info: '#7AC1E9', // Azul claro (agua del logo)
        
        // Semantic Colors
        success: '#43A047',
        warning: '#FFA726',
        error: '#EF5350',
        
        // Background
        background: {
          light: '#FAFAF9',
          dark: '#121417',
        },
        
        // Text Colors
        text: {
          primary: '#1F2937',    // Gray-900 for main text
          secondary: '#6B7280',  // Gray-500 for secondary text
          tertiary: '#9CA3AF',   // Gray-400 for disabled/placeholder
          inverse: '#FFFFFF',    // White for dark backgrounds
        },
        
        // Surface Colors
        surface: {
          light: '#FFFFFF',
          dark: '#1F2937',
          hover: '#F3F4F6',      // Gray-100
        },
        
        // Border Colors
        border: {
          light: '#E5E7EB',      // Gray-200
          medium: '#D1D5DB',     // Gray-300
          dark: '#9CA3AF',       // Gray-400
        },
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['10px', { lineHeight: '14px' }],
        sm: ['12px', { lineHeight: '16px' }],
        base: ['14px', { lineHeight: '20px' }],
        lg: ['16px', { lineHeight: '24px' }],
        xl: ['18px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
