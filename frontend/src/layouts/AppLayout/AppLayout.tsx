/**
 * AppLayout.tsx — Orquestrador do layout autenticado do Reativa
 *
 * Estrutura de renderização:
 *   PrivateRoute (auth check)
 *     └── AppLayout (este componente)
 *           ├── Sidebar (aside fixo ou overlay mobile)
 *           ├── backdrop (overlay escuro em mobile)
 *           └── .app-layout__body
 *                 ├── Header (sticky, 60px)
 *                 └── main.app-layout__main
 *                       └── <Outlet /> ← conteúdo da página atual
 *
 * Responsabilidades:
 *   ✓ Estado local isSidebarOpen — controla overlay em mobile
 *   ✓ Fecha sidebar automaticamente ao mudar de rota
 *   ✓ Passa props para Sidebar (isOpen, onClose) e Header (isSidebarOpen, onMenuToggle)
 *   ✓ Renderiza <Outlet /> dentro do <main> — páginas não precisam de wrapper
 *
 * Prevenção de duplicação:
 *   Sidebar e Header aparecem UMA vez aqui.
 *   Cada página renderiza apenas seu conteúdo — sem estrutura de layout.
 */

import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import './AppLayout.css';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Fecha a sidebar ao navegar — UX mobile: o usuário não precisa fechar manualmente
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleMenuToggle = () => setIsSidebarOpen((prev) => !prev);
  const handleSidebarClose = () => setIsSidebarOpen(false);

  return (
    <div className="app-layout">
      {/* Sidebar: fixo no desktop, overlay deslizante no mobile */}
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

      {/*
        Backdrop: clique fora da sidebar fecha em mobile.
        Renderizado condicionalmente — não existe no DOM quando sidebar está fechada.
        aria-hidden: elemento puramente visual/interativo, sem conteúdo para leitores de tela.
      */}
      {isSidebarOpen && (
        <div
          className="app-layout__backdrop"
          onClick={handleSidebarClose}
          aria-hidden="true"
        />
      )}

      {/* Corpo: header sticky + área de conteúdo scrollável */}
      <div className="app-layout__body">
        <Header
          isSidebarOpen={isSidebarOpen}
          onMenuToggle={handleMenuToggle}
        />

        {/*
          <main> semântico — landmark "main" detectado por leitores de tela.
          Único <main> da página (Sidebar usa <aside>, Header usa <header>).
          Páginas renderizam seu conteúdo diretamente aqui via <Outlet />.
        */}
        <main className="app-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
