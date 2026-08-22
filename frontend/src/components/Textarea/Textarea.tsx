/**
 * Textarea.tsx — Campo de texto multilinha do Reativa
 *
 * Reutiliza as classes CSS do Input (input-field, input-field__control, etc.)
 * O Input.css já contém a regra `textarea.input-field__control` com height auto.
 *
 * Interface idêntica ao Input — substituto direto para campos de texto longo.
 * Integração com React Hook Form via spread de register().
 */

// Input.css cobre os estilos de textarea.input-field__control
import '../Input/Input.css';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  className?: string;
  rows?: number;
}

export function Textarea({
  label,
  id,
  error,
  hint,
  className = '',
  required,
  rows = 3,
  ...props
}: TextareaProps) {
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

      <textarea
        id={id}
        rows={rows}
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

      {hint && !error && (
        <p id={hintId} className="input-field__hint">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="input-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
