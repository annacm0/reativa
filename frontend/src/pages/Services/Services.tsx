/**
 * Services.tsx — Página de listagem de serviços
 *
 * Responsabilidades:
 *   ✓ Lista serviços com busca por nome (debounced 300ms)
 *   ✓ Drawer lateral para criação de novo serviço
 *   ✓ Link de edição por item → /services/:id
 *   ✓ Exclusão com ConfirmDialog (somente ADMIN)
 *   ✓ Dois cenários de 409: nome duplicado (inline) e atendimentos vinculados (alert)
 *   ✓ Estados: loading, erro, vazio (sem cadastro), vazio (sem resultado)
 *
 * 409 na exclusão:
 *   O frontend sempre tenta o DELETE e deixa o backend decidir.
 *   Se o serviço tiver atendimentos (Restrict), o backend retorna 409.
 *   O ConfirmDialog fecha e um Alert aparece na listagem com a mensagem.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  useServices,
  useCreateService,
  useDeleteService,
} from '../../hooks/useServices';
import { useDebounce } from '../../hooks/useDebounce';
import { Button } from '../../components/Button/Button';
import { Loading } from '../../components/Loading/Loading';
import { Alert } from '../../components/Alert/Alert';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { ServiceForm, type ServiceFormData } from './ServiceForm';
import type { Service } from '../../types/api';
import './Services.css';

// ──────────────────────────────────────────────────────────────────────────────

export default function Services() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // ── Busca ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data: services, isLoading, isError, refetch } = useServices(debouncedSearch);

  // ── Drawer de criação ─────────────────────────────────────────────────────
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [createApiError, setCreateApiError] = useState<string | null>(null);
  const [createNameConflict, setCreateNameConflict] = useState<string | null>(null);
  const createService = useCreateService();

  const handleCreate = async (data: ServiceFormData) => {
    setCreateApiError(null);
    setCreateNameConflict(null);
    try {
      await createService.mutateAsync({
        name: data.name,
        returnIntervalDays: data.returnIntervalDays,
        durationMinutes: data.durationMinutes,
      });
      setIsDrawerOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível criar o serviço.';
      // 409 de nome duplicado → erro inline no campo Nome
      if (message.includes('Já existe um serviço')) {
        setCreateNameConflict(message);
      } else {
        setCreateApiError(message);
      }
    }
  };

  const handleOpenDrawer = () => {
    setCreateApiError(null);
    setCreateNameConflict(null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setCreateApiError(null);
    setCreateNameConflict(null);
    setIsDrawerOpen(false);
  };

  // ── Exclusão ──────────────────────────────────────────────────────────────
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteService = useDeleteService();

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    setDeleteError(null);
    try {
      await deleteService.mutateAsync(serviceToDelete.id);
      setServiceToDelete(null);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : 'Não foi possível excluir o serviço.';
      setServiceToDelete(null); // fecha o dialog mesmo em caso de 409
      setDeleteError(message);  // exibe o Alert na listagem
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="services-page">
      {/* Título + botão novo */}
      <div className="services-header">
        <h1 className="services-header__title">Serviços</h1>
        <Button
          variant="primary"
          size="md"
          onClick={handleOpenDrawer}
          aria-label="Novo serviço"
        >
          <Plus size={16} aria-hidden="true" strokeWidth={2.5} />
          Novo serviço
        </Button>
      </div>

      {/* Campo de busca */}
      <div className="services-search">
        <Search
          className="services-search__icon"
          size={16}
          aria-hidden="true"
          strokeWidth={2}
        />
        <input
          className="services-search__input"
          type="search"
          placeholder="Buscar por nome…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar serviços por nome"
          autoComplete="off"
        />
      </div>

      {/* Erro na exclusão (inclusive 409 de atendimentos vinculados) */}
      {deleteError && (
        <Alert variant="warning">{deleteError}</Alert>
      )}

      {/* Erro global de listagem */}
      {isError && (
        <Alert variant="error">
          Não foi possível carregar os serviços.{' '}
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
      {isLoading && <Loading text="Carregando serviços…" />}

      {/* Lista de serviços */}
      {!isLoading && !isError && services && services.length > 0 && (
        <ul className="services-list" role="list">
          {services.map((service) => (
            <li key={service.id} className="service-item">
              <div className="service-item__info">
                <p className="service-item__name">{service.name}</p>
                <div className="service-item__meta">
                  <span className="service-item__interval">
                    {service.returnIntervalDays} dias
                  </span>
                  {service.durationMinutes != null && (
                    <>
                      <span className="service-item__separator" aria-hidden="true" />
                      <span className="service-item__duration">
                        {service.durationMinutes} min
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="service-item__actions">
                <Link
                  to={`/services/${service.id}`}
                  className="btn btn--ghost btn--sm"
                  aria-label={`Editar ${service.name}`}
                >
                  <Pencil size={14} aria-hidden="true" strokeWidth={2} />
                  Editar
                </Link>

                {/* Exclusão — somente ADMIN */}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeleteError(null);
                      setServiceToDelete(service);
                    }}
                    aria-label={`Excluir ${service.name}`}
                    style={{ color: 'var(--color-error)' }}
                  >
                    <Trash2 size={14} aria-hidden="true" strokeWidth={2} />
                    Excluir
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Estado vazio — sem serviços cadastrados */}
      {!isLoading && !isError && services?.length === 0 && !debouncedSearch && (
        <EmptyState
          icon={Briefcase}
          title="Nenhum serviço cadastrado"
          description="Cadastre os serviços que sua empresa oferece para ativar o motor de reativação."
          action={
            <Button variant="primary" onClick={handleOpenDrawer}>
              <Plus size={15} aria-hidden="true" strokeWidth={2.5} />
              Novo serviço
            </Button>
          }
        />
      )}

      {/* Estado vazio — sem resultado na busca */}
      {!isLoading && !isError && services?.length === 0 && debouncedSearch && (
        <EmptyState
          icon={Search}
          title={`Nenhum serviço encontrado para "${debouncedSearch}"`}
          description="Tente outro termo ou verifique a ortografia."
        />
      )}

      {/* ── DRAWER DE CRIAÇÃO ───────────────────────────────────────────────── */}
      {isDrawerOpen && (
        <>
          <div
            className="service-drawer-backdrop"
            onClick={handleCloseDrawer}
            aria-hidden="true"
          />
          <aside
            className="service-drawer"
            aria-label="Novo serviço"
            role="complementary"
          >
            <div className="service-drawer__header">
              <h2 className="service-drawer__title">Novo serviço</h2>
              <button
                className="service-drawer__close"
                onClick={handleCloseDrawer}
                type="button"
                aria-label="Fechar painel de criação"
              >
                ✕
              </button>
            </div>
            <div className="service-drawer__body">
              <ServiceForm
                submitLabel="Criar serviço"
                onSubmit={handleCreate}
                onCancel={handleCloseDrawer}
                apiError={createApiError}
                nameConflictError={createNameConflict}
              />
            </div>
          </aside>
        </>
      )}

      {/* ── DIALOG DE CONFIRMAÇÃO DE EXCLUSÃO ───────────────────────────────── */}
      <ConfirmDialog
        isOpen={Boolean(serviceToDelete)}
        title="Excluir serviço"
        description={
          serviceToDelete
            ? `Tem certeza que deseja excluir "${serviceToDelete.name}"? Esta ação é irreversível.`
            : ''
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setServiceToDelete(null);
          setDeleteError(null);
        }}
        isLoading={deleteService.isPending}
      />
    </div>
  );
}
