/**
 * Header.tsx — Cabeçalho da área de conteúdo autenticada
 *
 * Responsabilidades:
 *   ✓ Exibe o título da página atual (derivado do pathname)
 *   ✓ Exibe o nome do usuário autenticado (user.name do AuthContext)
 *   ✓ Renderiza o botão hamburger em mobile (toggle da sidebar)
 *
 * Título da página:
 *   Derivado do pathname atual via um mapa estático.
 *   Rotas filhas (ex: /clients/:id) fazem match por prefixo.
 *   Isso evita que cada página precise gerenciar um estado de título externo.
 *   Quando páginas precisarem de títulos dinâmicos (ex: "Ana — Detalhe"),
 *   o caminho natural será um Context simples — adicionado quando necessário.
 *
 * Acessibilidade:
 *   ✓ <header> — landmark "banner" detectado por leitores de tela
 *   ✓ Botão hamburger com aria-label e aria-expanded (estado aberto/fechado)
 *   ✓ Ícone do hamburger com aria-hidden (decorativo)
 *   ✓ Título como <p> — h1 fica dentro do conteúdo de cada página
 */

import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

// ── MAPA DE TÍTULOS ────────────────────────────────────────────────────────
// Centralizado aqui — único lugar para manter ou adicionar títulos.
// Quando uma nova rota for adicionada, adicionar também aqui.

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
  // Match exato
  const exact = PAGE_TITLES[pathname];
  if (exact) return exact;

  // Match por prefixo (sub-rotas como /clients/:id)
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
}

// ── COMPONENTE ─────────────────────────────────────────────────────────────

export function Header({ isSidebarOpen, onMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const pageTitle = derivePageTitle(pathname);

  return (
    <header className="app-header">
      {/*
        Botão hamburger — visível somente em mobile (display: none no desktop via CSS).
        aria-expanded informa o estado da sidebar para leitores de tela.
        aria-controls seria ideal mas a sidebar não tem id fixo no MVP.
      */}
      <button
        className="app-header__menu-btn"
        onClick={onMenuToggle}
        type="button"
        aria-label={isSidebarOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
        aria-expanded={isSidebarOpen}
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      {/*
        Título da página — <p> sem semântica de heading.
        O <h1> real de cada página fica dentro do conteúdo (app-layout__main).
        Isso evita dois h1 na mesma página, mantendo a hierarquia correta.
      */}
      <p className="app-header__title">{pageTitle}</p>

      {/* Nome do usuário autenticado */}
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
