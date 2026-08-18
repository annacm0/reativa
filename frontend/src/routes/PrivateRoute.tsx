/**
 * routes/PrivateRoute.tsx — Proteção de rotas autenticadas
 *
 * Comportamento:
 *   isLoading = true  → exibe Loading (verificação inicial do token)
 *   isAuthenticated   → renderiza a página via <Outlet />
 *   não autenticado   → redireciona para /login, preservando a rota tentada
 *
 * A rota original é salva em location.state.from para que o Login
 * possa redirecionar o usuário de volta após autenticação bem-sucedida.
 *
 * Uso em App.tsx:
 *   <Route element={<PrivateRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *     <Route path="/clients" element={<Clients />} />
 *   </Route>
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loading } from '../components/Loading/Loading';

export function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Verificação inicial do token em andamento — aguarda antes de decidir
  if (isLoading) {
    return <Loading fullPage text="Verificando sessão..." />;
  }

  // Não autenticado → redireciona para login
  // state.from preserva a rota tentada para redirect pós-login
  if (!isAuthenticated) {
    return (
      <Navigate to="/login" state={{ from: location }} replace />
    );
  }

  // Autenticado → renderiza a rota filha
  return <Outlet />;
}
