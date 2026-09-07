import './Badge.css';

// ──────────────────────────────────────────────────────────────────────────────
// Badge — indicador de status do Reativa
//
// Variantes de status do motor de reativação:
//   normal   → cliente no prazo (mais de 7 dias para o retorno)
//   proximo  → próximo do retorno (0–7 dias) — atenção
//   atrasado → passou do período esperado — ação necessária
//
// Outras variantes:
//   success  → ação concluída
//   error    → falha
//   neutral  → informação sem urgência (roles, tags)
//
// Acessibilidade:
//   ✓ Nunca comunica estado apenas por cor
//   ✓ Ponto indicador (forma) + texto explícito
//   ✓ O ponto é aria-hidden (decorativo — o texto já comunica o estado)
// ──────────────────────────────────────────────────────────────────────────────

export type BadgeVariant =
  | 'normal'
  | 'proximo'
  | 'atrasado'
  | 'success'
  | 'error'
  | 'neutral';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'neutral',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span className={`badge badge--${variant} ${className}`.trim()}>
      {/* Ponto decorativo — reforça a cor com uma forma. aria-hidden evita leitura dupla. */}
      <span className="badge__dot" aria-hidden="true" />
      {children}
    </span>
  );
}
