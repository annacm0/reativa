import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';

// QueryClient configura o comportamento global do cache do TanStack Query.
// Esses valores são conservadores e funcionam bem para a maioria dos casos.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tempo que os dados ficam "frescos" antes de re-buscar: 30 segundos
      staleTime: 1000 * 30,
      // Número de tentativas em caso de erro de rede
      retry: 1,
      // Não re-buscar automaticamente ao focar na janela (evita requisições desnecessárias)
      refetchOnWindowFocus: false,
    },
  },
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento root não encontrado no index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    {/* QueryClientProvider disponibiliza o cache para toda a aplicação */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
