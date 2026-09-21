/**
 * Appointments.tsx — Página de listagem e registro de atendimentos
 *
 * Responsabilidades:
 *   ✓ Lista atendimentos com client e service aninhados (sem chamada extra)
 *   ✓ Drawer lateral para registro de novo atendimento
 *   ✓ Exclusão com ConfirmDialog (somente ADMIN)
 *   ✓ Estados: loading, erro, vazio, lista
 *
 * Imutabilidade:
 *   Sem botão de edição — atendimento é registro histórico.
 *   O backend não expõe PUT/PATCH para appointments.
 *
 * Multi-tenancy:
 *   Nenhum companyId é enviado pelo frontend.
 *   O backend retorna apenas atendimentos da empresa autenticada.
 */

import { useState } from 'react';
import { Plus, ClipboardList, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  useAppointments,
  useCreateAppointment,
  useDeleteAppointment,
} from '../../hooks/useAppointments';
import { Button } from '../../components/Button/Button';
import { Loading } from '../../components/Loading/Loading';
import { Alert } from '../../components/Alert/Alert';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { AppointmentForm } from './AppointmentForm';
import type { Appointment } from '../../types/api';
import type { CreateAppointmentFormData } from '../../schemas/appointment.schema';
import './Appointments.css';

// ── UTILITÁRIOS ────────────────────────────────────────────────────────────

/**
 * Formata uma data ISO (YYYY-MM-DD ou ISO completo) para dd/MM/yyyy.
 * Usa split para evitar conversão de timezone — apenas manipulação de string.
 */
function formatDateBR(dateStr: string): string {
  // Suporta "2026-08-22" e "2026-08-22T00:00:00.000Z"
  const datePart = dateStr.split('T')[0];
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
}

// ── COMPONENTE ─────────────────────────────────────────────────────────────

export default function Appointments() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // ── Listagem ─────────────────────────────────────────────────────────────
  const { data: appointments, isLoading, isError, refetch } = useAppointments();

  // ── Drawer de criação ─────────────────────────────────────────────────────
  const [isDrawerOpen, setIsDrawerOpen]   = useState(false);
  const [createError, setCreateError]     = useState<string | null>(null);
  const createAppointment                 = useCreateAppointment();

  const handleCreate = async (data: CreateAppointmentFormData) => {
    setCreateError(null);
    try {
      await createAppointment.mutateAsync({
        clientId:  data.clientId,
        serviceId: data.serviceId,
        date:      data.date,
        notes:     data.notes || undefined,
      });
      setIsDrawerOpen(false); // fecha o drawer — lista atualiza via invalidação
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar o atendimento.'
      );
    }
  };

  const handleOpenDrawer = () => {
    setCreateError(null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setCreateError(null);
    setIsDrawerOpen(false);
  };

  // ── Exclusão ──────────────────────────────────────────────────────────────
  const [apptToDelete, setApptToDelete] = useState<Appointment | null>(null);
  const [deleteError, setDeleteError]   = useState<string | null>(null);
  const deleteAppointment               = useDeleteAppointment();

  const handleDeleteConfirm = async () => {
    if (!apptToDelete) return;
    setDeleteError(null);
    try {
      await deleteAppointment.mutateAsync(apptToDelete.id);
      setApptToDelete(null); // fecha o dialog — lista atualiza via invalidação
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir o atendimento.'
      );
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="appointments-page">
      {/* Cabeçalho */}
      <div className="appointments-header page-header">
        <h1 className="appointments-header__title page-header__title">Atendimentos</h1>
        {/* Botão oculto quando lista está vazia — evita CTA duplicado com o EmptyState */}
        {appointments && appointments.length > 0 && (
          <Button
            variant="primary"
            size="md"
            className="page-header__btn appt-header__btn"
            onClick={handleOpenDrawer}
            aria-label="Registrar atendimento"
          >
            <Plus size={16} aria-hidden="true" strokeWidth={2.5} />
            Registrar atendimento
          </Button>
        )}
      </div>

      {/* Erro da listagem */}
      {isError && (
        <Alert variant="error">
          Não foi possível carregar os atendimentos.{' '}
          <button
            onClick={() => refetch()}
            style={{
              textDecoration: 'underline',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              color: 'inherit',
              fontFamily: 'inherit',
              fontSize: 'inherit',
            }}
          >
            Tentar novamente
          </button>
        </Alert>
      )}

      {/* Loading */}
      {isLoading && <Loading text="Carregando atendimentos…" />}

      {/* Lista de atendimentos */}
      {!isLoading && !isError && appointments && appointments.length > 0 && (
        <ul className="appointments-list" role="list">
          {appointments.map((appt) => (
            <li key={appt.id} className="appt-item" role="listitem">
              <div className="appt-item__info">
                {/* Cliente e serviço em destaque */}
                <p className="appt-item__names">
                  <span className="appt-item__client">{appt.client.name}</span>
                  <span className="appt-item__separator" aria-hidden="true">·</span>
                  <span className="appt-item__service">{appt.service.name}</span>
                </p>

                {/* Data + observação */}
                <div className="appt-item__meta">
                  <time
                    className="appt-item__date"
                    dateTime={appt.date.split('T')[0]}
                  >
                    {formatDateBR(appt.date)}
                  </time>
                  {appt.notes && (
                    <>
                      <span className="appt-item__dot" aria-hidden="true" />
                      <span className="appt-item__notes" title={appt.notes}>
                        {appt.notes}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Ações — somente ADMIN pode excluir */}
              {isAdmin && (
                <div className="appt-item__actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeleteError(null);
                      setApptToDelete(appt);
                    }}
                    aria-label={`Excluir atendimento de ${appt.client.name} em ${formatDateBR(appt.date)}`}
                    style={{ color: 'var(--color-error)' }}
                  >
                    <Trash2 size={14} aria-hidden="true" strokeWidth={2} />
                    Excluir
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Estado vazio */}
      {!isLoading && !isError && appointments?.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum atendimento registrado"
          description="Registre o primeiro atendimento para começar a acompanhar o histórico dos seus clientes."
          action={
            <Button variant="primary" onClick={handleOpenDrawer}>
              <Plus size={15} aria-hidden="true" strokeWidth={2.5} />
              Registrar atendimento
            </Button>
          }
        />
      )}

      {/* Erro de exclusão — exibido após fechar o dialog */}
      {deleteError && !apptToDelete && (
        <Alert variant="error">{deleteError}</Alert>
      )}

      {/* ── DRAWER DE CRIAÇÃO ─────────────────────────────────────────────── */}
      {isDrawerOpen && (
        <>
          <div
            className="appt-drawer-backdrop"
            onClick={handleCloseDrawer}
            aria-hidden="true"
          />
          <aside
            className="appt-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appt-drawer-title"
          >
            <div className="appt-drawer__header">
              <h2 id="appt-drawer-title" className="appt-drawer__title">
                Registrar atendimento
              </h2>
              <button
                className="appt-drawer__close"
                onClick={handleCloseDrawer}
                type="button"
                aria-label="Fechar painel de registro"
              >
                ✕
              </button>
            </div>
            <div className="appt-drawer__body">
              <AppointmentForm
                onSubmit={handleCreate}
                onCancel={handleCloseDrawer}
                apiError={createError}
                isSubmitting={createAppointment.isPending}
              />
            </div>
          </aside>
        </>
      )}

      {/* ── DIALOG DE CONFIRMAÇÃO DE EXCLUSÃO ─────────────────────────────── */}
      <ConfirmDialog
        isOpen={Boolean(apptToDelete)}
        title="Excluir atendimento"
        description={
          apptToDelete
            ? `Tem certeza de que deseja excluir o atendimento de ${apptToDelete.client.name} (${apptToDelete.service.name}, ${formatDateBR(apptToDelete.date)})? Este registro não poderá ser recuperado.`
            : ''
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setApptToDelete(null);
          setDeleteError(null);
        }}
        isLoading={deleteAppointment.isPending}
      />
    </div>
  );
}
