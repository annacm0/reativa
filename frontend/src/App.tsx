import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './routes/PrivateRoute';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';

// ──────────────────────────────────────────────────────────────────────────────
// Placeholder temporário — substituído página a página nas etapas seguintes.
// Usa HTML semântico (<main>, <h1>) e classes do design system.
// ──────────────────────────────────────────────────────────────────────────────
function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="placeholder-page">
      <h1 className="page-title">{title}</h1>
      <p className="helper-text">Em desenvolvimento…</p>
    </main>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// AppRoutes — componente interno que acessa o QueryClient
//
// Por que separar de App?
//   O AuthProvider precisa do queryClient (para queryClient.clear() no logout).
//   O useQueryClient() só funciona dentro do QueryClientProvider.
//   O QueryClientProvider está em main.tsx, que envolve <App />.
//   Logo, AppRoutes (filho de App) pode chamar useQueryClient() normalmente.
//
//   Estrutura de provedores (de fora para dentro):
//     QueryClientProvider (main.tsx)
//       BrowserRouter (App.tsx)
//         AuthProvider (AppRoutes — usa queryClient do contexto acima)
//           rotas
// ──────────────────────────────────────────────────────────────────────────────
function AppRoutes() {
  const queryClient = useQueryClient();

  return (
    <AuthProvider queryClient={queryClient}>
      <Routes>
        {/* ── Rotas públicas ───────────────────────────────────────────── */}
        {/* Acessíveis sem autenticação */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Rotas protegidas ─────────────────────────────────────────── */}
        {/*
          PrivateRoute verifica autenticação antes de renderizar qualquer filho.
          - Não autenticado → redireciona para /login (preserva rota de destino)
          - isLoading → exibe Loading (verificação inicial do token)
          - Autenticado → renderiza via <Outlet />
          
          companyId nunca vem do frontend — é parte do token JWT gerenciado
          exclusivamente pelo AuthContext e validado pelo backend em cada requisição.
        */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<PlaceholderPage title="Início" />} />
          <Route path="/clients" element={<PlaceholderPage title="Clientes" />} />
          <Route
            path="/clients/:id"
            element={<PlaceholderPage title="Detalhe do Cliente" />}
          />
          <Route path="/services" element={<PlaceholderPage title="Serviços" />} />
          <Route
            path="/appointments"
            element={<PlaceholderPage title="Atendimentos" />}
          />
          <Route
            path="/retention"
            element={<PlaceholderPage title="Clientes para Reativar" />}
          />
        </Route>

        {/* ── Raiz → dashboard ─────────────────────────────────────────── */}
        {/* PrivateRoute redireciona para /login se não autenticado */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── 404 ──────────────────────────────────────────────────────── */}
        <Route
          path="*"
          element={<PlaceholderPage title="Página não encontrada" />}
        />
      </Routes>
    </AuthProvider>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// App — ponto de entrada de roteamento
// BrowserRouter envolve AppRoutes para que useNavigate/useLocation funcionem.
// ──────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
