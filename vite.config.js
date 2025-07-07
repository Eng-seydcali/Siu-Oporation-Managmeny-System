import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: process.env.NODE_ENV === 'production' 
          ? 'https://siu-oporation-managmeny-system.onrender.com'
          : 'http://localhost:5005',
        changeOrigin: true,
        secure: true,
        ws: true
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});