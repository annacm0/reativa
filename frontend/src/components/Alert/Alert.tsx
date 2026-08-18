import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import './Alert.css';

// ──────────────────────────────────────────────────────────────────────────────
// Alert — feedback contextual para o usuário
//
// Variantes:
//   error   → falha de login, erro de rede, problema de API
//   success → ação concluída com sucesso
//   info    → aviso neutro, informação
//   warning → atenção, sem ser um erro
//
// Acessibilidade:
//   ✓ role="alert" — leitores de tela anunciam o conteúdo imediatamente
//   ✓ aria-live="assertive" para error (urgente), "polite" para demais
//   ✓ Ícone decorativo (aria-hidden) — o texto é a comunicação principal
//   ✓ Nunca comunica estado apenas pela cor do ícone
//
// Uso:
//   <Alert variant="error">Email ou senha inválidos.</Alert>
//   <Alert variant="success">Conta criada com sucesso!</Alert>
// ──────────────────────────────────────────────────────────────────────────────

export type AlertVariant = 'error' | 'success' | 'info' | 'warning';

export interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

// Mapa de ícones — importados individualmente para tree-shaking
// Cada ícone é aria-hidden (decorativo — o texto é que comunica o estado)
const ICONS: Record<AlertVariant, React.ElementType> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
};

export function Alert({
  variant = 'info',
  children,
  className = '',
}: AlertProps) {
  const Icon = ICONS[variant];

  return (
    <div
      className={`alert alert--${variant} ${className}`.trim()}
      role="alert"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <Icon
        className="alert__icon"
        size={16}
        aria-hidden="true"
        strokeWidth={2.5}
      />
      <span className="alert__content">{children}</span>
    </div>
  );
}
