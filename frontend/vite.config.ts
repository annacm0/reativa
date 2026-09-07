import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Tailwind removido — o Reativa usa CSS tradicional organizado em arquivos .css separados.
    // Design system centralizado em src/styles/variables.css.
  ],
  server: {
    port: 5173,
    // Proxy: redireciona chamadas /api para o backend durante o desenvolvimento.
    // Assim o frontend pode fazer fetch('/api/clients') sem precisar da URL completa
    // e sem problemas de CORS no ambiente local.
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
});
