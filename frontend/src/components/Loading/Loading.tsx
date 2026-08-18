import './Loading.css';

// ──────────────────────────────────────────────────────────────────────────────
// Loading — indicador de carregamento do Reativa
//
// Tamanhos:
//   sm  → inline, dentro de cards ou listas
//   md  → padrão, seções de conteúdo
//   lg  → carregamento de página inteira
//
// Acessibilidade:
//   ✓ role="status" — informa o leitor de tela sobre o estado de carregamento
//   ✓ aria-live="polite" — anuncia quando o texto mudar (ex: "Carregando clientes...")
//   ✓ O spinner tem aria-hidden (decorativo — o texto já comunica o estado)
//   ✓ Se sem texto visível, visually-hidden garante leitura acessível
//
// Uso:
//   <Loading />                           → spinner + "Carregando..."
//   <Loading text="Buscando clientes..." />
//   <Loading size="lg" fullPage />        → centralizado na tela
// ──────────────────────────────────────────────────────────────────────────────

export interface LoadingProps {
  /** Texto exibido ao lado do spinner */
  text?: string;
  /** Tamanho do spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Ocupa o espaço de uma página inteira (min-height) */
  fullPage?: boolean;
  /** Classe adicional para posicionamento */
  className?: string;
}

export function Loading({
  text = 'Carregando...',
  size = 'md',
  fullPage = false,
  className = '',
}: LoadingProps) {
  const classes = [
    'loading',
    `loading--${size}`,
    fullPage ? 'loading--fullpage' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="status" aria-live="polite">
      {/* Spinner decorativo — aria-hidden evita que o leitor de tela descreva o elemento visual */}
      <span className="loading__spinner" aria-hidden="true" />

      {text ? (
        <span className="loading__text">{text}</span>
      ) : (
        /* Se não houver texto visível, garante leitura acessível */
        <span className="visually-hidden">Carregando...</span>
      )}
    </div>
  );
}
