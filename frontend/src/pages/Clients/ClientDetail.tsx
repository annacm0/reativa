/**
 * ClientDetail.tsx — Página de detalhe e edição de cliente
 *
 * Responsabilidades:
 *   ✓ Carrega o cliente pelo :id da URL
 *   ✓ Pré-preenche o formulário com os dados atuais
 *   ✓ Salva alterações com feedback inline (sem redirect)
 *   ✓ Botão Salvar desabilitado até haver mudança (isDirty guard)
 *   ✓ Telefone pré-preenchido formatado para legibilidade
 *   ✓ Breadcrumb "← Clientes" para navegação de retorno
 *
 * Telefone pré-preenchido:
 *   O backend salva "5511999999999". Para o formulário de edição, o telefone
 *   é exibido formatado "(11) 99999-9999" via formatPhoneDisplay.
 *   O usuário pode editar e o backend normaliza novamente ao salvar.
 *
 * Sucesso inline:
 *   Após salvar, exibe uma mensagem de sucesso no formulário por 3 segundos.
 *   Não redireciona — mantém o contexto da edição.
 *   role="alert" no componente Alert garante anúncio por leitores de tela.
 */

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useClient, useUpdateClient } from '../../hooks/useClients';
import { formatPhoneDisplay } from '../../utils/phone.utils';
import { Loading } from '../../components/Loading/Loading';
import { Alert } from '../../components/Alert/Alert';
import { ClientForm, type ClientFormData } from './ClientForm';
import './ClientDetail.css';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: client, isLoading, isError } = useClient(id ?? '');
  const updateClient = useUpdateClient(id ?? '');

  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (data: ClientFormData) => {
    setApiError(null);
    setSuccessMessage(null);

    try {
      await updateClient.mutateAsync({
        name: data.name,
        phone: data.phone,
        email: data.email?.trim() || null,
        notes: data.notes?.trim() || null,
      });

      setSuccessMessage('Alterações salvas com sucesso.');
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : 'Não foi possível salvar as alterações.'
      );
    }
  };

  // ── Estados de carregamento e erro do fetch ────────────────────────────────

  if (isLoading) {
    return (
      <div className="client-detail-page">
        <Link to="/clients" className="client-detail__back">
          <ChevronLeft size={16} aria-hidden="true" />
          Clientes
        </Link>
        <Loading text="Carregando cliente…" />
      </div>
    );
  }

  if (isError || !client) {
    return (
      <div className="client-detail-page">
        <Link to="/clients" className="client-detail__back">
          <ChevronLeft size={16} aria-hidden="true" />
          Clientes
        </Link>
        <Alert variant="error">
          Cliente não encontrado ou você não tem permissão para acessá-lo.
        </Alert>
      </div>
    );
  }

  // ── Render principal ──────────────────────────────────────────────────────

  return (
    <div className="client-detail-page">
      {/* Breadcrumb de retorno */}
      <Link to="/clients" className="client-detail__back">
        <ChevronLeft size={16} aria-hidden="true" strokeWidth={2.5} />
        Clientes
      </Link>

      {/* Título — h1 da página */}
      <div className="client-detail__header">
        <h1 className="client-detail__name">{client.name}</h1>
      </div>

      {/* Card com o formulário de edição */}
      <div className="client-detail__card">
        <ClientForm
          defaultValues={{
            name: client.name,
            // Pré-preenche formatado para legibilidade — backend normaliza ao salvar
            phone: formatPhoneDisplay(client.phone),
            email: client.email ?? '',
            notes: client.notes ?? '',
          }}
          submitLabel="Salvar alterações"
          onSubmit={handleSubmit}
          onCancel={() => window.history.back()}
          apiError={apiError}
          successMessage={successMessage}
          showDirtyGuard // desabilita Salvar até haver mudança
        />
      </div>
    </div>
  );
}
