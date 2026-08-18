/**
 * contexts/AuthContext.tsx — Estado central de autenticação do Reativa
 *
 * RESPONSABILIDADES:
 *   ✓ Mantém o usuário autenticado em memória (user: AuthUser | null)
 *   ✓ Verifica o token no localStorage ao iniciar a aplicação
 *   ✓ Valida expiração do token (campo exp) antes de reconstituir a sessão
 *   ✓ Executa login: chama o serviço, armazena token e usuário
 *   ✓ Executa logout: limpa token, usuário e cache do TanStack Query
 *   ✓ Expõe isLoading para evitar "flash" da tela de login em sessões ativas
 *
 * LÓGICA DE SEGURANÇA:
 *   - O token é decodificado APENAS para reconstruir o estado da interface
 *   - A assinatura NÃO é verificada no frontend (a chave secreta não pode ficar aqui)
 *   - O backend valida a assinatura em toda requisição autenticada
 *   - Se o token estiver expirado, inválido ou não decodificável:
 *       → é removido do localStorage
 *       → usuário é tratado como não autenticado
 *   - Os dados do usuário completo (nome, email) ficam em localStorage
 *     para reconstrução sem chamada extra ao servidor
 *
 * ACESSO:
 *   Componentes e páginas usam apenas o hook useAuth() — nunca acessam
 *   localStorage, token ou getToken() diretamente.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { getToken, setToken, removeToken } from '../services/api';
import * as authService from '../services/auth.service';
import type { LoginData, RegisterData } from '../services/auth.service';
import type { AuthUser } from '../types/api';

// ── DECODE DO PAYLOAD JWT ─────────────────────────────────────────────────────
// O token JWT tem 3 partes separadas por ponto: header.payload.signature
// O payload é codificado em base64url — decodificamos para ler os dados.
// NÃO verificamos a assinatura (responsabilidade do backend).

interface JwtPayload {
  userId: string;
  companyId: string;
  role: 'ADMIN' | 'MEMBER';
  /** Timestamp Unix (segundos) de expiração do token */
  exp: number;
}

function decodeTokenPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // base64url → base64 → JSON
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded: unknown = JSON.parse(atob(padded));

    // Valida que os campos esperados existem e têm os tipos corretos
    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof (decoded as Record<string, unknown>).userId !== 'string' ||
      typeof (decoded as Record<string, unknown>).companyId !== 'string' ||
      typeof (decoded as Record<string, unknown>).role !== 'string' ||
      typeof (decoded as Record<string, unknown>).exp !== 'number'
    ) {
      return null;
    }

    return decoded as JwtPayload;
  } catch {
    // Token mal-formado — trata como inválido
    return null;
  }
}

function isTokenExpired(exp: number): boolean {
  // exp está em segundos; Date.now() em milissegundos
  return Date.now() / 1000 >= exp;
}

// ── ARMAZENAMENTO DO USUÁRIO COMPLETO ─────────────────────────────────────────
// O payload JWT contém apenas userId, companyId e role.
// Para name e email (usados na UI), armazenamos o objeto user retornado
// pelo backend no login/register. Isso evita uma chamada extra ao servidor
// no carregamento inicial.
const USER_KEY = 'reativa:user';

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function setStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function removeStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}

// ── TIPO DO CONTEXTO ──────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Dados do usuário autenticado. null = não autenticado */
  user: AuthUser | null;
  /** Atalho: true quando user !== null */
  isAuthenticated: boolean;
  /**
   * true durante a verificação inicial do token ao montar a aplicação.
   * Use para evitar "flash" da tela de login em sessões ativas.
   * PrivateRoute exibe Loading enquanto isLoading for true.
   */
  isLoading: boolean;
  /** Faz login: chama a API, armazena token e usuário */
  login(data: LoginData): Promise<void>;
  /** Faz cadastro: chama a API, armazena token e usuário */
  register(data: RegisterData): Promise<void>;
  /**
   * Faz logout: limpa token, dados do usuário e cache do TanStack Query.
   * Redireciona para /login via window.location.href (reload completo).
   */
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── HOOK ──────────────────────────────────────────────────────────────────────

/**
 * Hook para acessar o contexto de autenticação.
 * Lança erro se usado fora do AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      'useAuth() deve ser chamado dentro de um <AuthProvider>. ' +
        'Verifique se o AuthProvider envolve o componente que está usando este hook.'
    );
  }
  return ctx;
}

// ── PROVIDER ──────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: React.ReactNode;
  /**
   * Instância do QueryClient passada como prop para que logout()
   * possa chamar queryClient.clear() — remove dados do usuário anterior do cache.
   * Isso evita que dados de uma sessão apareçam em outra após logout/login.
   */
  queryClient: QueryClient;
}

export function AuthProvider({ children, queryClient }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Verificação inicial do token ────────────────────────────────────────────
  // Executada uma única vez ao montar o AuthProvider.
  // Reconstrói a sessão a partir do token local sem chamada ao servidor.
  useEffect(() => {
    const token = getToken();

    // Sem token → não autenticado
    if (!token) {
      setIsLoading(false);
      return;
    }

    const payload = decodeTokenPayload(token);

    // Token inválido ou expirado → limpa e trata como não autenticado
    if (!payload || isTokenExpired(payload.exp)) {
      removeToken();
      removeStoredUser();
      setIsLoading(false);
      return;
    }

    // Token válido → reconstrói o usuário a partir dos dados armazenados
    const storedUser = getStoredUser();

    if (storedUser) {
      setUser(storedUser);
    } else {
      // Fallback: o user completo não estava no localStorage por algum motivo.
      // Usa os dados disponíveis no payload. name e email ficarão vazios até
      // o próximo login, mas a sessão permanece autenticada.
      setUser({
        id: payload.userId,
        name: '',
        email: '',
        role: payload.role,
        companyId: payload.companyId,
      });
    }

    setIsLoading(false);
  }, []);

  // ── LOGIN ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (data: LoginData): Promise<void> => {
    // authService.login() lança Error com mensagem amigável em caso de falha
    const response = await authService.login(data);
    setToken(response.token);
    setStoredUser(response.user);
    setUser(response.user);
  }, []);

  // ── REGISTER ────────────────────────────────────────────────────────────────
  const register = useCallback(async (data: RegisterData): Promise<void> => {
    const response = await authService.register(data);
    setToken(response.token);
    setStoredUser(response.user);
    setUser(response.user);
  }, []);

  // ── LOGOUT ──────────────────────────────────────────────────────────────────
  const logout = useCallback((): void => {
    removeToken();
    removeStoredUser();
    setUser(null);

    // Limpa o cache do TanStack Query — dados do usuário anterior não devem
    // aparecer na próxima sessão (ex: outra pessoa fazendo login no mesmo browser)
    queryClient.clear();

    // window.location.href força reload completo — limpa todo o estado React.
    // Decisão de MVP: simples e garante isolamento entre sessões.
    window.location.href = '/login';
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
