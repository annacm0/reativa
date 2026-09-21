/**
 * Sidebar.tsx — Barra de navegação lateral do Reativa
 *
 * Semântica HTML:
 *   <aside>  → elemento de navegação complementar (landmark acessível)
 *   <nav>    → lista de navegação principal com aria-label
 *   NavLink  → <a> com active state automático pelo React Router
 *
 * Acessibilidade:
 *   ✓ <aside> é detectado como landmark "complementary" por leitores de tela
 *   ✓ <nav aria-label="Navegação principal"> distingue de outras navs da página
 *   ✓ role="list" em <ul> (necessário quando list-style é removido por CSS)
 *   ✓ Ícones com aria-hidden — o texto do label é a comunicação principal
 *   ✓ Botão de fechar com aria-label descritivo
 *   ✓ Logout com texto visível ("Sair") — não depende apenas de ícone
 *   ✓ Todos os elementos interativos com :focus-visible configurado no CSS
 *   ✓ closeBtnRef passado pelo AppLayout para mover foco ao abrir a sidebar
 *   ✓ Nome do usuário exibido no rodapé mobile — disponível mesmo quando
 *      ocultado do Header em telas muito estreitas (≤400px)
 */

import { Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ClipboardList,
  RefreshCw,
  LogOut,
  X,
  User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

// ── ITENS DE NAVEGAÇÃO ─────────────────────────────────────────────────────
// Definidos fora do componente — constante estável, sem re-criação a cada render.
// Ícones importados individualmente para tree-shaking (sem importar o lucide inteiro).

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  /**
   * end=true: item só fica ativo em match exato.
   * Necessário para /dashboard — sem isso, "/" matcharia todas as rotas.
   */
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',    label: 'Início',       icon: LayoutDashboard, end: true },
  { to: '/clients',      label: 'Clientes',     icon: Users },
  { to: '/services',     label: 'Serviços',     icon: Briefcase },
  { to: '/appointments', label: 'Atendimentos', icon: ClipboardList },
  { to: '/retention',    label: 'Reativação',   icon: RefreshCw },
];

// ── PROPS ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  /** Sidebar aberta em mobile */
  isOpen: boolean;
  /** Callback para fechar a sidebar (botão X ou backdrop) */
  onClose: () => void;
  /** Ref do botão fechar — AppLayout move foco para cá ao abrir a sidebar */
  closeBtnRef: React.RefObject<HTMLButtonElement | null>;
}

// ── COMPONENTE ─────────────────────────────────────────────────────────────

export function Sidebar({ isOpen, onClose, closeBtnRef }: SidebarProps) {
  const { logout, user } = useAuth();

  return (
    <aside
      className={`sidebar${isOpen ? ' sidebar--open' : ''}`}
      aria-label="Barra lateral"
    >
      {/* ── Área da marca ───────────────────────────────────────────────── */}
      <div className="sidebar__brand">
        <Link
          to="/dashboard"
          className="sidebar__brand-link"
          aria-label="Reativa — ir para o início"
        >
          {/*
            Logo placeholder — substituir por <img> quando o logo definitivo estiver disponível.
            aria-hidden no SVG porque o texto "Reativa" ao lado já descreve o link.
          */}
          <div className="sidebar__brand-mark" aria-hidden="true">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="sidebar__brand-name">Reativa</span>
        </Link>

        {/* Botão fechar — visível apenas em mobile (display: none no desktop via CSS) */}
        <button
          ref={closeBtnRef}
          className="sidebar__close"
          onClick={onClose}
          type="button"
          aria-label="Fechar menu de navegação"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {/* ── Navegação principal ──────────────────────────────────────────── */}
      <nav className="sidebar__nav" aria-label="Navegação principal">
        {/*
          role="list" é necessário quando list-style é removido por CSS.
          Sem isso, alguns leitores de tela (VoiceOver/Safari) não anunciam a lista.
        */}
        <ul className="sidebar__nav-list" role="list">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `sidebar-nav__link${isActive ? ' sidebar-nav__link--active' : ''}`
                }
              >
                {/* Ícone decorativo — o texto do label é a comunicação principal */}
                <Icon
                  className="sidebar-nav__icon"
                  size={18}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Rodapé: usuário + logout ──────────────────────────────────────── */}
      {/*
        Separado da <nav> principal por semântica:
        logout é uma ação, não um destino de navegação.
        O nome do usuário é exibido aqui na sidebar — garante que o usuário
        sempre tenha acesso à sua identificação, mesmo quando o nome é ocultado
        do Header em telas muito estreitas (≤400px).
      */}
      <div className="sidebar__footer">
        {/* Nome do usuário — visível apenas em mobile (oculto no desktop via CSS) */}
        {user?.name && (
          <div className="sidebar__user" aria-label={`Usuário: ${user.name}`}>
            <User size={14} aria-hidden="true" className="sidebar__user-icon" />
            <span className="sidebar__user-name">{user.name}</span>
          </div>
        )}

        <button
          className="sidebar__logout"
          onClick={logout}
          type="button"
        >
          <LogOut size={16} strokeWidth={2} aria-hidden="true" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
