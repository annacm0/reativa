import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Tailwind CSS v4 como plugin Vite — mais rápido que a abordagem PostCSS
    tailwindcss(),
  ],
  server: {
    port: 5173,
    // Proxy: redireciona chamadas /api para o backend durante o desenvolvimento
    // Assim o frontend pode fazer fetch('/api/health') sem precisar da URL completa
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
});
