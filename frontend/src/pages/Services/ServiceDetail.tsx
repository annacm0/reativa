/**
 * ServiceDetail.tsx — Página de detalhe e edição de serviço
 *
 * Responsabilidades:
 *   ✓ Carrega o serviço pelo :id da URL
 *   ✓ Pré-preenche o formulário com os dados atuais
 *   ✓ Salva alterações com feedback inline (sem redirect)
 *   ✓ Botão Salvar desabilitado até haver mudança (isDirty guard)
 *   ✓ Breadcrumb "← Serviços" para navegação de retorno
 *
 * Dois cenários de erro ao salvar:
 *   - 409 nome duplicado → prop nameConflictError → erro inline no campo Nome
 *   - Outros erros       → prop apiError → Alert acima do formulário
 *
 * Identificação do 409 de nome:
 *   Verifica se a mensagem contém "Já existe um serviço" — string exata do backend.
 *   Não depende do status HTTP diretamente, pois o service.ts já extrai a mensagem.
 */

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useService, useUpdateService } from '../../hooks/useServices';
import { Loading } from '../../components/Loading/Loading';
import { Alert } from '../../components/Alert/Alert';
import { ServiceForm, type ServiceFormData } from './ServiceForm';
import './ServiceDetail.css';

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: service, isLoading, isError } = useService(id ?? '');
  const updateService = useUpdateService(id ?? '');

  const [apiError, setApiError] = useState<string | null>(null);
  const [nameConflictError, setNameConflictError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (data: ServiceFormData) => {
    setApiError(null);
    setNameConflictError(null);
    setSuccessMessage(null);

    try {
      await updateService.mutateAsync({
        name: data.name,
        returnIntervalDays: data.returnIntervalDays,
        // undefined → não envia o campo; o backend mantém o valor atual
        // null → remove o valor (durationMinutes nullable no backend)
        durationMinutes: data.durationMinutes ?? null,
      });
      setSuccessMessage('Alterações salvas com sucesso.');
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Não foi possível salvar as alterações.';

      // 409 nome duplicado → erro inline no campo Nome
      if (message.includes('Já existe um serviço')) {
        setNameConflictError(message);
      } else {
        setApiError(message);
      }
    }
  };

  // ── Estados de carregamento e erro do fetch ────────────────────────────────

  if (isLoading) {
    return (
      <div className="service-detail-page">
        <Link to="/services" className="service-detail__back">
          <ChevronLeft size={16} aria-hidden="true" />
          Serviços
        </Link>
        <Loading text="Carregando serviço…" />
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="service-detail-page">
        <Link to="/services" className="service-detail__back">
          <ChevronLeft size={16} aria-hidden="true" />
          Serviços
        </Link>
        <Alert variant="error">
          Serviço não encontrado ou você não tem permissão para acessá-lo.
        </Alert>
      </div>
    );
  }

  // ── Render principal ──────────────────────────────────────────────────────

  return (
    <div className="service-detail-page">
      {/* Breadcrumb de retorno */}
      <Link to="/services" className="service-detail__back">
        <ChevronLeft size={16} aria-hidden="true" strokeWidth={2.5} />
        Serviços
      </Link>

      {/* h1 da página — nome do serviço atual */}
      <div className="service-detail__header">
        <h1 className="service-detail__name">{service.name}</h1>
      </div>

      {/* Card com o formulário de edição */}
      <div className="service-detail__card">
        <ServiceForm
          defaultValues={{
            name: service.name,
            returnIntervalDays: service.returnIntervalDays,
            // null (sem duração) → undefined → campo vazio no formulário
            durationMinutes: service.durationMinutes ?? undefined,
          }}
          submitLabel="Salvar alterações"
          onSubmit={handleSubmit}
          onCancel={() => window.history.back()}
          apiError={apiError}
          nameConflictError={nameConflictError}
          successMessage={successMessage}
          showDirtyGuard
        />
      </div>
    </div>
  );
}
