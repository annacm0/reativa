/**
 * ClientForm.tsx — Formulário reutilizável de cliente
 *
 * Usado em:
 *   - Drawer de criação (Clients.tsx) → defaultValues vazio, submitLabel "Criar cliente"
 *   - Página de edição (ClientDetail.tsx) → defaultValues com dados atuais
 *
 * Telefone — formatação visual durante digitação:
 *   Usa formatPhoneInput() para formatar enquanto o usuário digita.
 *   O valor formatado "(11) 99999-9999" é enviado ao backend sem normalização.
 *   O backend (client.service.ts no backend) normaliza para "5511999999999".
 *   O Zod valida apenas que há ≥ 10 dígitos — não bloqueia formatos intermediários.
 *
 * Email/Notes vazios:
 *   Strings vazias são tratadas pelo clients.service.ts como "não informado"
 *   (omitidos do payload de criação, enviados como null na edição para limpar).
 *
 * isDirty (somente edição):
 *   Quando showDirtyGuard=true, o botão Salvar é desabilitado até haver mudança.
 *   Evita envios desnecessários ao backend.
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClientSchema, type CreateClientFormData } from '../../schemas/client.schema';
import { formatPhoneInput } from '../../utils/phone.utils';
import { Input } from '../../components/Input/Input';
import { Textarea } from '../../components/Textarea/Textarea';
import { Button } from '../../components/Button/Button';
import { Alert } from '../../components/Alert/Alert';
import './ClientForm.css';

export interface ClientFormData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export interface ClientFormProps {
  /** Valores iniciais — deixar undefined para formulário de criação */
  defaultValues?: Partial<ClientFormData>;
  /** Texto do botão de confirmação */
  submitLabel?: string;
  /** Callback chamado com os dados validados */
  onSubmit: (data: ClientFormData) => Promise<void>;
  /** Callback de cancelamento/fechar */
  onCancel: () => void;
  /** Mensagem de erro da API — exibida acima do formulário */
  apiError?: string | null;
  /** Mensagem de sucesso inline — exibida após salvar */
  successMessage?: string | null;
  /**
   * Quando true, o botão Salvar fica desabilitado até haver mudança nos campos.
   * Recomendado para formulários de edição. Não usar em criação.
   */
  showDirtyGuard?: boolean;
}

export function ClientForm({
  defaultValues,
  submitLabel = 'Salvar',
  onSubmit,
  onCancel,
  apiError,
  successMessage,
  showDirtyGuard = false,
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CreateClientFormData>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      phone: defaultValues?.phone ?? '',
      email: defaultValues?.email ?? '',
      notes: defaultValues?.notes ?? '',
    },
  });

  // Handler do campo telefone: formata visualmente durante a digitação
  const phoneRegister = register('phone');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneInput(e.target.value);
    e.target.value = formatted;
    phoneRegister.onChange(e);
  };

  const handleFormSubmit = async (data: CreateClientFormData) => {
    await onSubmit({
      name: data.name,
      phone: data.phone,
      email: data.email ?? '',
      notes: data.notes ?? '',
    });
  };

  return (
    <form
      className="client-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
    >
      {/* Erro da API */}
      {apiError && (
        <Alert variant="error">{apiError}</Alert>
      )}

      {/* Sucesso inline */}
      {successMessage && !apiError && (
        <Alert variant="success">{successMessage}</Alert>
      )}

      {/* Nome */}
      <Input
        label="Nome"
        id="client-name"
        type="text"
        autoComplete="off"
        placeholder="Nome do cliente"
        disabled={isSubmitting}
        error={errors.name?.message}
        required
        {...register('name')}
      />

      {/* Linha: Telefone + Email */}
      <div className="client-form__row">
        <Input
          label="Telefone"
          id="client-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(11) 99999-9999"
          disabled={isSubmitting}
          error={errors.phone?.message}
          required
          {...phoneRegister}
          onChange={handlePhoneChange}
        />

        <Input
          label="Email"
          id="client-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="cliente@email.com"
          disabled={isSubmitting}
          error={errors.email?.message}
          hint="Opcional"
          {...register('email')}
        />
      </div>

      {/* Observações */}
      <Textarea
        label="Observações"
        id="client-notes"
        placeholder="Informações úteis sobre este cliente…"
        disabled={isSubmitting}
        error={errors.notes?.message}
        hint="Opcional — visível apenas para sua equipe"
        rows={3}
        {...register('notes')}
      />

      {/* Ações */}
      <div className="client-form__actions">
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
          disabled={showDirtyGuard && !isDirty}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
