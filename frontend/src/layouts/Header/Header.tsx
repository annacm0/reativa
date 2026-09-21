/**
 * Header.tsx — Cabeçalho da área de conteúdo autenticada
 *
 * Responsabilidades:
 *   ✓ Renderiza o botão hamburger em mobile (toggle da sidebar)
 *   ✓ Em mobile (≤768px): exibe o nome da página atual ao lado do hambúrguer
 *   ✓ Exibe o nome do usuário autenticado (user.name do AuthContext)
 *
 * Título da página no Header (mobile only):
 *   Derivado do pathname atual via mapa estático.
 *   Em desktop, o título fica exclusivamente no conteúdo (.page-header__title).
 *   Em mobile, o .page-header__title é ocultado via CSS (globals.css) e o
 *   título aparece aqui no header, ao lado do hambúrguer — sem duplicação.
 *   Rotas filhas (ex: /clients/:id) fazem match por prefixo.
 *
 * Acessibilidade:
 *   ✓ <header> — landmark "banner" detectado por leitores de tela
 *   ✓ Botão hamburger com aria-label e aria-expanded (estado aberto/fechado)
 *   ✓ Ícone do hamburger com aria-hidden (decorativo)
 *   ✓ Título como <p> — h1 real fica dentro do conteúdo de cada página
 *   ✓ menuBtnRef passado pelo AppLayout para devolução de foco ao fechar sidebar
 */

import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

// ── MAPA DE TÍTULOS ────────────────────────────────────────────────────────
// Centralizado aqui — único lugar para manter ou adicionar títulos.
// Exibido SOMENTE em mobile (≤768px) no Header.
// Em desktop, o título fica no <h1> dentro do conteúdo de cada página.

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':    'Início',
  '/clients':      'Clientes',
  '/services':     'Serviços',
  '/appointments': 'Atendimentos',
  '/retention':    'Reativação',
};

/**
 * Deriva o título da página a partir do pathname atual.
 *
 * Estratégia:
 *   1. Tenta match exato (ex: /clients → "Clientes")
 *   2. Tenta match por prefixo (ex: /clients/abc-123 → "Clientes")
 *   3. Fallback: "Reativa"
 */
function derivePageTitle(pathname: string): string {
  const exact = PAGE_TITLES[pathname];
  if (exact) return exact;

  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(path + '/')) return title;
  }

  return 'Reativa';
}

// ── PROPS ──────────────────────────────────────────────────────────────────

interface HeaderProps {
  /** true quando a sidebar está aberta em mobile */
  isSidebarOpen: boolean;
  /** Toggle da sidebar — passado ao botão hamburger */
  onMenuToggle: () => void;
  /** Ref do botão hamburger — para devolução de foco ao fechar a sidebar */
  menuBtnRef: React.RefObject<HTMLButtonElement | null>;
}

// ── COMPONENTE ─────────────────────────────────────────────────────────────

export function Header({ isSidebarOpen, onMenuToggle, menuBtnRef }: HeaderProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const pageTitle = derivePageTitle(pathname);

  return (
    <header className="app-header">
      {/*
        Botão hamburger — visível somente em mobile (display: none no desktop via CSS).
        aria-expanded informa o estado da sidebar para leitores de tela.
        menuBtnRef permite devolução de foco ao fechar a sidebar.
      */}
      <button
        ref={menuBtnRef}
        className="app-header__menu-btn"
        onClick={onMenuToggle}
        type="button"
        aria-label={isSidebarOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
        aria-expanded={isSidebarOpen}
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {/*
        Título da página — visível SOMENTE em mobile (display: none no desktop via CSS).
        Em desktop, o título fica no <h1> do conteúdo (.page-header__title).
        Em mobile, o .page-header__title é ocultado (globals.css) e este
        <p> exibe o nome da página ao lado do hambúrguer — sem duplicação.
      */}
      <p className="app-header__title">{pageTitle}</p>

      {/*
        Spacer — empurra o nome do usuário para a direita.
        Em desktop, o hamburger está oculto; o spacer ocupa o lado esquerdo.
        Em mobile, hamburger + título ocupam a esquerda; o spacer preenche o meio.
      */}
      <div className="app-header__spacer" aria-hidden="true" />

      {/* Nome do usuário autenticado — oculto em telas muito pequenas (≤375px) */}
      {user?.name && (
        <div className="app-header__user">
          <span className="app-header__user-name" title={user.name}>
            {user.name}
          </span>
        </div>
      )}
    </header>
  );
}
