import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// As páginas serão criadas nas próximas etapas.
// Por enquanto, usamos placeholders para que o roteamento funcione.

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-surface-800">{title}</h1>
        <p className="text-surface-500 mt-2">Em desenvolvimento...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas (sem autenticação) */}
        <Route path="/login" element={<PlaceholderPage title="Login" />} />
        <Route path="/register" element={<PlaceholderPage title="Cadastro" />} />

        {/* Rotas protegidas (requerem autenticação) */}
        <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
        <Route path="/clients" element={<PlaceholderPage title="Clientes" />} />
        <Route path="/clients/:id" element={<PlaceholderPage title="Detalhe do Cliente" />} />
        <Route path="/pets" element={<PlaceholderPage title="Pets" />} />
        <Route path="/services" element={<PlaceholderPage title="Serviços" />} />
        <Route path="/appointments" element={<PlaceholderPage title="Atendimentos" />} />
        <Route path="/retention" element={<PlaceholderPage title="Reativação" />} />

        {/* Redireciona a raiz para o dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Rota 404 */}
        <Route path="*" element={<PlaceholderPage title="Página não encontrada" />} />
      </Routes>
    </BrowserRouter>
  );
}
