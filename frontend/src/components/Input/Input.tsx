import './Input.css';

// ──────────────────────────────────────────────────────────────────────────────
// Input — campo de formulário acessível do Reativa
//
// Acessibilidade integrada:
//   ✓ label associado ao input via htmlFor/id
//   ✓ aria-invalid quando há erro
//   ✓ aria-describedby liga o input à mensagem de erro/hint
//   ✓ aria-required indica campo obrigatório
//   ✓ role="alert" na mensagem de erro (anúncio imediato por leitores de tela)
//   ✓ Asterisco de obrigatório oculto para leitores de tela (aria-hidden)
//
// Uso com React Hook Form:
//   const { register, formState: { errors } } = useForm();
//   <Input
//     label="Email"
//     id="email"
//     type="email"
//     autoComplete="email"
//     error={errors.email?.message}
//     {...register('email')}
//   />
// ──────────────────────────────────────────────────────────────────────────────

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Texto do label — obrigatório para acessibilidade */
  label: string;
  /** ID único — vincula label ao input e às mensagens de erro/hint */
  id: string;
  /** Mensagem de erro exibida abaixo do campo */
  error?: string;
  /** Texto de ajuda exibido quando não há erro */
  hint?: string;
  /** Adiciona wrapper ao redor do input (útil em layouts de formulário) */
  className?: string;
}

export function Input({
  label,
  id,
  error,
  hint,
  className = '',
  required,
  ...props
}: InputProps) {
  // IDs das mensagens acessórias — usados em aria-describedby
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`input-field ${className}`.trim()}>
      <label htmlFor={id} className="input-field__label">
        {label}
        {required && (
          <span className="input-field__required" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <input
        id={id}
        className={[
          'input-field__control',
          error ? 'input-field__control--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required}
        required={required}
        {...props}
      />

      {/* Hint: exibido apenas quando não há erro */}
      {hint && !error && (
        <p id={hintId} className="input-field__hint">
          {hint}
        </p>
      )}

      {/* Erro: role="alert" faz o leitor de tela anunciar ao aparecer */}
      {error && (
        <p id={errorId} className="input-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
