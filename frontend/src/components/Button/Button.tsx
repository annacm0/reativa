import './Button.css';

// ──────────────────────────────────────────────────────────────────────────────
// Button — componente base de ação do Reativa
//
// Variantes:
//   primary   → CTA principal (entrar, salvar, confirmar)
//   secondary → Ação secundária (cancelar, voltar)
//   ghost     → Ação discreta (ícones, links de navegação)
//   danger    → Ações destrutivas (excluir) — sempre com confirmação
//
// Tamanhos:
//   sm → 32px — ações compactas dentro de tabelas ou cards
//   md → 40px — padrão (alinhado à altura dos inputs)
//   lg → 48px — CTAs de destaque (ex: botão de login)
//
// Acessibilidade:
//   - Sempre use children com texto descritivo
//   - Se usar apenas ícone, passe aria-label no ...props
//   - isLoading ativa aria-busy e exibe spinner com texto oculto
// ──────────────────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Estilo visual do botão */
  variant?: ButtonVariant;
  /** Altura do botão: sm=32px, md=40px, lg=48px */
  size?: ButtonSize;
  /** Exibe spinner e bloqueia interação durante envio */
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    isLoading ? 'btn--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <>
          {/* Spinner é decorativo — o texto "Aguarde..." é o que o leitor de tela anuncia */}
          <span className="btn__spinner" aria-hidden="true" />
          <span className="visually-hidden">Aguarde...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
