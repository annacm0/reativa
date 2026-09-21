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
 * Gerenciamento de foco (acessibilidade mobile):
 *   ✓ Ao abrir: foco movido para o botão "fechar" dentro da sidebar
 *   ✓ Esc fecha a sidebar
 *   ✓ Ao fechar: foco devolvido ao botão hambúrguer que abriu
 *   ✓ inert no .app-layout__body impede foco/interação com o conteúdo de fundo
 *      enquanto a sidebar está aberta em mobile
 *   ✓ inert NÃO é aplicado à sidebar (que está fora do .app-layout__body)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import './AppLayout.css';

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Referência ao botão hambúrguer — para devolver foco ao fechar
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  // Referência ao botão "fechar" dentro da sidebar — foco ao abrir
  const sidebarCloseBtnRef = useRef<HTMLButtonElement>(null);
  // Referência ao .app-layout__body — recebe inert em mobile quando sidebar abre
  const bodyRef = useRef<HTMLDivElement>(null);

  // Fecha a sidebar ao navegar — UX mobile: o usuário não precisa fechar manualmente
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Gerencia inert + foco ao abrir/fechar a sidebar
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    // Detecta se estamos em modo mobile (sidebar como overlay)
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;

    if (isSidebarOpen) {
      // Impede interação com o conteúdo de fundo
      body.setAttribute('inert', '');
      // Move foco para o botão fechar da sidebar
      // Pequeno delay para aguardar a animação de abertura
      const timer = setTimeout(() => {
        sidebarCloseBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Restaura interação com o conteúdo
      body.removeAttribute('inert');
    }
  }, [isSidebarOpen]);

  // Fecha com Esc — apenas em mobile quando sidebar está aberta
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
        // Devolve foco ao hambúrguer após fechamento por Esc
        menuBtnRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  const handleMenuToggle = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setIsSidebarOpen(false);
    // Devolve foco ao botão hambúrguer que iniciou a abertura
    menuBtnRef.current?.focus();
  }, []);

  return (
    <div className="app-layout">
      {/* Sidebar: fixo no desktop, overlay deslizante no mobile */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        closeBtnRef={sidebarCloseBtnRef}
      />

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

      {/*
        .app-layout__body recebe inert quando a sidebar mobile está aberta.
        Isso impede foco e interação com o conteúdo de fundo (header + main).
        A sidebar está FORA deste elemento — portanto não é afetada pelo inert.
      */}
      <div className="app-layout__body" ref={bodyRef}>
        <Header
          isSidebarOpen={isSidebarOpen}
          onMenuToggle={handleMenuToggle}
          menuBtnRef={menuBtnRef}
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
