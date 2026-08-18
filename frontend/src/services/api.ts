/**
 * services/api.ts — Cliente HTTP centralizado do Reativa
 *
 * RESPONSABILIDADES DESTE ARQUIVO:
 *   ✓ Única camada que lê/escreve o token em localStorage
 *   ✓ Injeta o header Authorization em toda requisição autenticada
 *   ✓ Intercepta 401 e redireciona para /login (logout automático)
 *   ✓ Define a baseURL — sem hardcode de URL nos serviços
 *
 * NENHUM outro arquivo deve acessar localStorage diretamente.
 * Para leitura do token: use getToken(). Para logout: use removeToken().
 *
 * NOTA DE SEGURANÇA (MVP):
 *   O token é armazenado em localStorage por simplicidade no MVP.
 *   Em produção, a evolução recomendada é httpOnly cookie, que requer:
 *     - Endpoint /api/auth/logout no backend (para expirar o cookie)
 *     - CORS configurado com credentials: true
 *     - SameSite=Strict no cookie
 *   Enquanto isso, evitamos dangerouslySetInnerHTML e execução de
 *   strings vindas da API — as principais vetores de XSS.
 */

import axios from 'axios';

// ── CHAVE DO TOKEN ────────────────────────────────────────────────────────────
// Centralizada aqui — um único lugar para mudar caso a estratégia de
// armazenamento evolua (ex: sessionStorage, IndexedDB, cookie).
const TOKEN_KEY = 'reativa:token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── INSTÂNCIA AXIOS ───────────────────────────────────────────────────────────
// baseURL '/api' usa o proxy configurado em vite.config.ts:
//   proxy: { '/api': { target: 'http://localhost:3333' } }
// Em produção, o servidor de deploy fará o mesmo redirecionamento.
// Isso evita hardcode de URL e problemas de CORS.
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── INTERCEPTOR DE REQUEST ────────────────────────────────────────────────────
// Injeta o token em todas as requisições automaticamente.
// Se não houver token, a requisição prossegue sem o header Authorization —
// o backend retornará 401 e o interceptor de response tratará.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── INTERCEPTOR DE RESPONSE ───────────────────────────────────────────────────
// Captura respostas 401 (token inválido ou expirado pelo backend).
//
// window.location.href força um reload completo da página — limpa todo o
// estado React e a memória da aplicação. Escolha de MVP: simples e eficaz.
// Alternativas mais elegantes (event emitter, BroadcastChannel) seriam
// overengineering para este estágio do produto.
//
// Não redireciona se já estiver nas páginas de autenticação — evita loop.
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const isAxiosErr =
      error !== null &&
      typeof error === 'object' &&
      'response' in error &&
      error.response !== null &&
      typeof error.response === 'object' &&
      'status' in error.response;

    if (isAxiosErr && (error.response as { status: number }).status === 401) {
      removeToken();
      const isAuthPage = ['/login', '/register'].some((path) =>
        window.location.pathname.startsWith(path)
      );
      if (!isAuthPage) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
