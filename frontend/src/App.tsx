import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './routes/PrivateRoute';
import { AppLayout } from './layouts/AppLayout/AppLayout';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ClientsPage from './pages/Clients/Clients';
import ClientDetail from './pages/Clients/ClientDetail';
import ServicesPage from './pages/Services/Services';
import ServiceDetail from './pages/Services/ServiceDetail';
import AppointmentsPage from './pages/Appointments/Appointments';

// ──────────────────────────────────────────────────────────────────────────────
// Placeholder temporário — substituído por página real em cada etapa seguinte.
// Renderiza dentro do <main> do AppLayout, sem wrapper de layout próprio.
// Não usa <main> — o AppLayout já fornece o único <main> da página.
// ──────────────────────────────────────────────────────────────────────────────
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="placeholder-page">
      <p className="page-title">{title}</p>
      <p className="helper-text">Em desenvolvimento…</p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// AppRoutes — acessa o QueryClient (precisa estar dentro do QueryClientProvider)
//
// Hierarquia de provedores (de fora para dentro):
//   QueryClientProvider (main.tsx)
//     BrowserRouter (App.tsx)
//       AuthProvider (AppRoutes)
//         PrivateRoute (verifica autenticação)
//           AppLayout (renderiza Sidebar + Header + Outlet)
//             páginas (renderizadas no Outlet do AppLayout)
// ──────────────────────────────────────────────────────────────────────────────
function AppRoutes() {
  const queryClient = useQueryClient();

  return (
    <AuthProvider queryClient={queryClient}>
      <Routes>
        {/* ── Rotas públicas ───────────────────────────────────────────── */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Rotas protegidas ─────────────────────────────────────────── */}
        {/*
          PrivateRoute verifica autenticação:
            - isLoading     → exibe Loading
            - não autenticado → redireciona /login com state.from
            - autenticado   → renderiza filho via Outlet

          AppLayout renderiza o layout permanente (Sidebar + Header):
            - Sidebar e Header aparecem UMA vez aqui
            - Cada página renderiza apenas seu conteúdo via Outlet

          companyId nunca vem do frontend — JWT gerenciado pelo AuthContext.
        */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"    element={<PlaceholderPage title="Início" />} />
            <Route path="/clients"      element={<ClientsPage />} />
            <Route path="/clients/:id"  element={<ClientDetail />} />
            <Route path="/services"     element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/retention"    element={<PlaceholderPage title="Clientes para Reativar" />} />
          </Route>
        </Route>

        {/* ── Raiz → dashboard ─────────────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── 404 ──────────────────────────────────────────────────────── */}
        <Route path="*" element={<PlaceholderPage title="Página não encontrada" />} />
      </Routes>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
