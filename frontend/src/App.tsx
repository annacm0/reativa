import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ──────────────────────────────────────────────────────────────────────────────
// Placeholder temporário — substituído página a página nas etapas seguintes.
// Usa HTML semântico (<main>, <h1>) e classes do design system, sem Tailwind.
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
// Estrutura de rotas do MVP:
//   Públicas:   /login, /register
//   Protegidas: /dashboard, /clients, /services, /appointments, /retention
//
// A proteção de rotas (PrivateRoute) será implementada na ETAPA 2,
// junto com o AuthContext. Até lá, todas as rotas são acessíveis.
// ──────────────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Rotas públicas ─────────────────────────────────────────── */}
        <Route path="/login" element={<PlaceholderPage title="Entrar" />} />
        <Route path="/register" element={<PlaceholderPage title="Criar conta" />} />

        {/* ── Rotas protegidas — core multissegmento ──────────────────── */}
        {/* companyId vem sempre do token JWT — nunca do frontend */}
        <Route path="/dashboard" element={<PlaceholderPage title="Início" />} />
        <Route path="/clients" element={<PlaceholderPage title="Clientes" />} />
        <Route path="/clients/:id" element={<PlaceholderPage title="Detalhe do Cliente" />} />
        <Route path="/services" element={<PlaceholderPage title="Serviços" />} />
        <Route path="/appointments" element={<PlaceholderPage title="Atendimentos" />} />
        <Route path="/retention" element={<PlaceholderPage title="Clientes para Reativar" />} />

        {/* ── Raiz → dashboard (usuário autenticado vai direto ao início) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── 404 ─────────────────────────────────────────────────────── */}
        <Route path="*" element={<PlaceholderPage title="Página não encontrada" />} />
      </Routes>
    </BrowserRouter>
  );
}
