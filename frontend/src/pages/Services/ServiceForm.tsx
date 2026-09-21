/**
 * ServiceForm.tsx — Formulário reutilizável de serviço
 *
 * Usado em:
 *   - Drawer de criação (Services.tsx)
 *   - Página de edição (ServiceDetail.tsx)
 *
 * Campos numéricos e React Hook Form:
 *   `valueAsNumber: true` no register faz o RHF entregar `number | NaN`
 *   ao Zod. O schema (service.schema.ts) trata:
 *     - returnIntervalDays obrigatório: NaN dispara invalid_type_error
 *     - durationMinutes opcional: z.preprocess converte NaN → undefined
 *
 * Conflito de nome (409):
 *   Exibido como erro inline no campo "Nome" via prop `nameConflictError`.
 *   Mais preciso que um Alert global — o usuário sabe exatamente o que corrigir.
 *
 * isDirty guard (showDirtyGuard):
 *   Botão Salvar desabilitado até haver mudança. Recomendado na edição.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createServiceSchema,
  type CreateServiceFormData,
} from '../../schemas/service.schema';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import './ServiceForm.css';

// Tipo dos valores do formulário — desacoplado do tipo inferido pelo Zod
// (necessário por causa do z.preprocess que retorna `unknown` no tipo de entrada)
type ServiceFormValues = {
  name: string;
  returnIntervalDays: number;
  durationMinutes?: number | undefined;
};

export interface ServiceFormData {
  name: string;
  returnIntervalDays: number;
  durationMinutes?: number;
}

export interface ServiceFormProps {
  defaultValues?: Partial<ServiceFormData>;
  submitLabel?: string;
  onSubmit: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
  /** Erro de API genérico — exibido acima do formulário */
  apiError?: string | null;
  /** Erro 409 de nome duplicado — exibido inline no campo Nome */
  nameConflictError?: string | null;
  /** Mensagem de sucesso inline — exibida após salvar na edição */
  successMessage?: string | null;
  /** Desabilita Salvar até haver mudança (usar na edição) */
  showDirtyGuard?: boolean;
}

export function ServiceForm({
  defaultValues,
  submitLabel = 'Salvar',
  onSubmit,
  onCancel,
  apiError,
  nameConflictError,
  successMessage,
  showDirtyGuard = false,
}: ServiceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<ServiceFormValues, unknown, CreateServiceFormData>({
    resolver: zodResolver(createServiceSchema),
    mode: 'onChange',
    defaultValues: {
      name: defaultValues?.name ?? '',
      returnIntervalDays: defaultValues?.returnIntervalDays,
      durationMinutes: defaultValues?.durationMinutes ?? undefined,
    },
  });

  const handleFormSubmit = async (data: CreateServiceFormData) => {
    await onSubmit({
      name: data.name,
      returnIntervalDays: data.returnIntervalDays,
      durationMinutes: data.durationMinutes ?? undefined,
    });
  };

  // Combina erro Zod do campo com erro de conflito 409 externo
  const nameError = errors.name?.message ?? nameConflictError ?? undefined;

  return (
    <form
      className="service-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
    >
      {/* Erro de API genérico */}
      {apiError && <Alert variant="error">{apiError}</Alert>}

      {/* Sucesso inline */}
      {successMessage && !apiError && (
        <Alert variant="success">{successMessage}</Alert>
      )}

      {/* Nome do serviço */}
      <Input
        label="Nome do serviço"
        id="service-name"
        type="text"
        autoComplete="off"
        placeholder="Ex: Banho e Tosa, Consulta de Rotina, Corte Feminino…"
        disabled={isSubmitting}
        error={nameError}
        required
        {...register('name')}
      />

      {/* Linha: Retorno esperado + Duração */}
      <div className="service-form__row">
        {/*
          returnIntervalDays — campo central do motor de reativação.
          Label e hint usam linguagem do empresário, não termos técnicos.
          valueAsNumber: o RHF entrega um number ao Zod (NaN quando vazio).
        */}
        <Input
          label="Retorno esperado (em dias)"
          id="service-return-interval"
          type="number"
          inputMode="numeric"
          min={1}
          max={3650}
          placeholder="Ex: 30"
          disabled={isSubmitting}
          error={errors.returnIntervalDays?.message}
          hint="O Reativa usa esse intervalo para identificar quando um cliente está próximo de voltar. Exemplo: Banho → 30, Consulta → 90, Revisão → 365."
          required
          {...register('returnIntervalDays', { valueAsNumber: true })}
        />

        {/*
          durationMinutes — informativo, não afeta o motor de reativação.
          Reservado para funcionalidade de agenda futura.
        */}
        <Input
          label="Duração da sessão (min)"
          id="service-duration"
          type="number"
          inputMode="numeric"
          min={1}
          max={1440}
          placeholder="Ex: 60"
          disabled={isSubmitting}
          error={errors.durationMinutes?.message}
          hint="Opcional. Informativo — não afeta o motor de reativação."
          {...register('durationMinutes', { valueAsNumber: true })}
        />
      </div>

      {/* Ações */}
      <div className="service-form__actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={!isValid || isSubmitting || (showDirtyGuard && !isDirty)}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
