import './EmptyState.css';

// ──────────────────────────────────────────────────────────────────────────────
// EmptyState — estado vazio reutilizável para listas sem resultado
//
// Reutilizável em: Clientes, Serviços, Atendimentos, Reativação
//
// Acessibilidade:
//   ✓ Ícone com aria-hidden (decorativo)
//   ✓ Título como <p> — o contexto da lista já estabelece o heading
//   ✓ Ação (botão/link) passada como children — flexível e acessível
// ──────────────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  /** Texto principal — "Nenhum cliente encontrado" */
  title: string;
  /** Texto auxiliar — instrução para o próximo passo */
  description?: string;
  /** Ícone lucide-react (React.ElementType) */
  icon?: React.ElementType;
  /** Botão, link ou qualquer elemento de ação */
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-state__icon" aria-hidden="true">
          <Icon size={44} strokeWidth={1.25} />
        </div>
      )}
      <p className="empty-state__title">{title}</p>
      {description && (
        <p className="empty-state__description">{description}</p>
      )}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
