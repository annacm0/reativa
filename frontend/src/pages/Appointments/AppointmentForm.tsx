/**
 * AppointmentForm.tsx — Formulário de registro de atendimento
 *
 * Usado dentro do drawer de criação.
 * Sem edição — atendimento é registro histórico imutável.
 *
 * Campos:
 *   clientId  — select com clientes da empresa (carregados via useClients)
 *   serviceId — select com serviços da empresa (carregados via useServices)
 *   date      — input[type=date] com max=hoje (UX: bloqueia futuras)
 *   notes     — textarea opcional, máx 500 chars
 *
 * Acessibilidade:
 *   ✓ Labels explícitos com htmlFor
 *   ✓ aria-describedby para hints e contagem de caracteres
 *   ✓ aria-invalid nos campos com erro
 *   ✓ aria-required nos campos obrigatórios
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useClients } from '../../hooks/useClients';
import { useServices } from '../../hooks/useServices';
import { Alert } from '../../components/Alert/Alert';
import { Button } from '../../components/Button/Button';
import {
  createAppointmentSchema,
  todayISO,
  type CreateAppointmentFormData,
} from '../../schemas/appointment.schema';
import './AppointmentForm.css';

// ── PROPS ──────────────────────────────────────────────────────────────────

export interface AppointmentFormProps {
  onSubmit: (data: CreateAppointmentFormData) => Promise<void>;
  onCancel: () => void;
  apiError: string | null;
  isSubmitting?: boolean;
}

// ── COMPONENTE ─────────────────────────────────────────────────────────────

export function AppointmentForm({
  onSubmit,
  onCancel,
  apiError,
  isSubmitting = false,
}: AppointmentFormProps) {
  // Carrega clientes e serviços para os selects
  // Dados já podem estar em cache se o usuário navegou por Clientes/Serviços
  const { data: clients = [], isLoading: loadingClients } = useClients();
  const { data: services = [], isLoading: loadingServices } = useServices();

  // Ordena alfabeticamente para facilitar a seleção
  const sortedClients  = [...clients].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const sortedServices = [...services].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting: formSubmitting, isValid },
  } = useForm<CreateAppointmentFormData>({
    resolver: zodResolver(createAppointmentSchema),
    mode: 'onChange',
    defaultValues: {
      clientId:  '',
      serviceId: '',
      date:      todayISO(), // pré-seleciona hoje
      notes:     '',
    },
  });

  const notesValue = watch('notes') ?? '';
  // Campos e botão Cancelar: bloqueados apenas durante submissão real
  const isActuallySubmitting = isSubmitting || formSubmitting;

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <form
      className="appt-form"
      onSubmit={handleFormSubmit}
      noValidate
      aria-label="Formulário de registro de atendimento"
    >
      {/* Erro da API — exibido no topo do formulário */}
      {apiError && (
        <Alert variant="error">
          {apiError}
        </Alert>
      )}

      {/* Cliente */}
      <div className="appt-form__field">
        <label htmlFor="appt-clientId" className="appt-form__label">
          Cliente <span aria-hidden="true">*</span>
        </label>
        <select
          id="appt-clientId"
          className={`appt-form__select${errors.clientId ? ' appt-form__select--error' : ''}`}
          aria-required="true"
          aria-invalid={Boolean(errors.clientId)}
          aria-describedby={errors.clientId ? 'appt-clientId-error' : undefined}
          disabled={isActuallySubmitting || loadingClients}
          {...register('clientId')}
        >
          <option value="">
            {loadingClients ? 'Carregando clientes…' : 'Selecione um cliente'}
          </option>
          {sortedClients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        {errors.clientId && (
          <span id="appt-clientId-error" className="appt-form__error" role="alert">
            {errors.clientId.message}
          </span>
        )}
      </div>

      {/* Serviço */}
      <div className="appt-form__field">
        <label htmlFor="appt-serviceId" className="appt-form__label">
          Serviço <span aria-hidden="true">*</span>
        </label>
        <select
          id="appt-serviceId"
          className={`appt-form__select${errors.serviceId ? ' appt-form__select--error' : ''}`}
          aria-required="true"
          aria-invalid={Boolean(errors.serviceId)}
          aria-describedby={errors.serviceId ? 'appt-serviceId-error' : undefined}
          disabled={isActuallySubmitting || loadingServices}
          {...register('serviceId')}
        >
          <option value="">
            {loadingServices ? 'Carregando serviços…' : 'Selecione um serviço'}
          </option>
          {sortedServices.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
        {errors.serviceId && (
          <span id="appt-serviceId-error" className="appt-form__error" role="alert">
            {errors.serviceId.message}
          </span>
        )}
      </div>

      {/* Data */}
      <div className="appt-form__field">
        <label htmlFor="appt-date" className="appt-form__label">
          Data do atendimento <span aria-hidden="true">*</span>
        </label>
        <input
          id="appt-date"
          type="date"
          className={`appt-form__input${errors.date ? ' appt-form__input--error' : ''}`}
          max={todayISO()}
          aria-required="true"
          aria-invalid={Boolean(errors.date)}
          aria-describedby={
            [errors.date ? 'appt-date-error' : '', 'appt-date-hint']
              .filter(Boolean)
              .join(' ') || undefined
          }
          disabled={isActuallySubmitting}
          {...register('date')}
        />
        <span id="appt-date-hint" className="appt-form__hint">
          Somente datas de hoje ou anteriores
        </span>
        {errors.date && (
          <span id="appt-date-error" className="appt-form__error" role="alert">
            {errors.date.message}
          </span>
        )}
      </div>

      {/* Observações */}
      <div className="appt-form__field">
        <label htmlFor="appt-notes" className="appt-form__label">
          Observação
          <span className="appt-form__label-optional">(opcional)</span>
        </label>
        <textarea
          id="appt-notes"
          className="appt-form__textarea"
          placeholder="Ex: cliente veio acompanhada da filha"
          rows={3}
          maxLength={500}
          aria-describedby="appt-notes-count"
          disabled={isActuallySubmitting}
          {...register('notes')}
        />
        <span
          id="appt-notes-count"
          className={`appt-form__char-count${notesValue.length >= 450 ? ' appt-form__char-count--warn' : ''}`}
          aria-live="polite"
        >
          {notesValue.length}/500
        </span>
        {errors.notes && (
          <span className="appt-form__error" role="alert">
            {errors.notes.message}
          </span>
        )}
      </div>

      {/* Ações */}
      <div className="appt-form__actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isActuallySubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isActuallySubmitting}
          disabled={!isValid || isActuallySubmitting}
        >
          Registrar atendimento
        </Button>
      </div>
    </form>
  );
}
