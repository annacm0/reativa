/**
 * Clients.tsx — Página de listagem de clientes
 *
 * Responsabilidades:
 *   ✓ Lista clientes com busca por nome (debounced 300ms)
 *   ✓ Drawer lateral para criação de novo cliente
 *   ✓ Link de edição por item → /clients/:id
 *   ✓ Exclusão com ConfirmDialog (somente ADMIN)
 *   ✓ Estados: loading, erro, vazio (sem cadastro), vazio (sem resultado)
 *
 * Multi-tenancy:
 *   Nenhum companyId é enviado — a API retorna apenas clientes
 *   da empresa autenticada (companyId vem do token JWT no backend).
 *
 * Role ADMIN:
 *   O botão de excluir é renderizado SOMENTE para usuários com role ADMIN.
 *   O backend também rejeita a requisição se o role for MEMBER (403).
 *   Isso é proteção de UX — não de segurança.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  useClients,
  useCreateClient,
  useDeleteClient,
} from '../../hooks/useClients';
import { useDebounce } from '../../hooks/useDebounce';
import { formatPhoneDisplay } from '../../utils/phone.utils';
import { Button } from '../../components/Button/Button';
import { Loading } from '../../components/Loading/Loading';
import { Alert } from '../../components/Alert/Alert';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { ClientForm, type ClientFormData } from './ClientForm';
import type { Client } from '../../types/api';
import './Clients.css';

// ──────────────────────────────────────────────────────────────────────────────

export default function Clients() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // ── Busca ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { data: clients, isLoading, isError, refetch } = useClients(debouncedSearch);

  // ── Drawer de criação ─────────────────────────────────────────────────────
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const createClient = useCreateClient();

  const handleCreate = async (data: ClientFormData) => {
    setCreateError(null);
    try {
      await createClient.mutateAsync({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        notes: data.notes || undefined,
      });
      setIsDrawerOpen(false); // fecha o drawer após sucesso (lista atualiza via invalidação)
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Não foi possível criar o cliente.'
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
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteClient = useDeleteClient();

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    setDeleteError(null);
    try {
      await deleteClient.mutateAsync(clientToDelete.id);
      setClientToDelete(null); // fecha o dialog — lista atualiza via invalidação
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : 'Não foi possível excluir o cliente.'
      );
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="clients-page">
      {/* Título + botão novo */}
      <div className="clients-header page-header">
        <h1 className="clients-header__title page-header__title">Clientes</h1>
        <Button
          variant="primary"
          size="md"
          className="page-header__btn"
          onClick={handleOpenDrawer}
          aria-label="Novo cliente"
        >
          <Plus size={16} aria-hidden="true" strokeWidth={2.5} />
          Novo cliente
        </Button>
      </div>

      {/* Campo de busca */}
      <div className="clients-search">
        <Search
          className="clients-search__icon"
          size={16}
          aria-hidden="true"
          strokeWidth={2}
        />
        <input
          className="clients-search__input"
          type="search"
          placeholder="Buscar por nome…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar clientes por nome"
          autoComplete="off"
        />
      </div>

      {/* Erro global de listagem */}
      {isError && (
        <Alert variant="error">
          Não foi possível carregar os clientes.{' '}
          <button
            onClick={() => refetch()}
            style={{ textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', fontFamily: 'inherit', fontSize: 'inherit' }}
          >
            Tentar novamente
          </button>
        </Alert>
      )}

      {/* Loading */}
      {isLoading && <Loading text="Carregando clientes…" />}

      {/* Lista de clientes */}
      {!isLoading && !isError && clients && clients.length > 0 && (
        <ul className="clients-list" role="list">
          {clients.map((client) => (
            <li key={client.id} className="client-item">
              <div className="client-item__info">
                <p className="client-item__name">{client.name}</p>
                <div className="client-item__meta">
                  <span className="client-item__phone">
                    {formatPhoneDisplay(client.phone)}
                  </span>
                  {client.email && (
                    <>
                      <span className="client-item__separator" aria-hidden="true" />
                      <span className="client-item__email" title={client.email}>
                        {client.email}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="client-item__actions">
                <Link
                  to={`/clients/${client.id}`}
                  className="btn btn--ghost btn--sm"
                  aria-label={`Editar ${client.name}`}
                >
                  <Pencil size={14} aria-hidden="true" strokeWidth={2} />
                  Editar
                </Link>

                {/* Botão excluir — somente ADMIN */}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeleteError(null);
                      setClientToDelete(client);
                    }}
                    aria-label={`Excluir ${client.name}`}
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

      {/* Estado vazio — sem clientes cadastrados */}
      {!isLoading && !isError && clients?.length === 0 && !debouncedSearch && (
        <EmptyState
          icon={Users}
          title="Nenhum cliente cadastrado"
          description="Comece cadastrando o primeiro cliente da sua empresa."
          action={
            <Button variant="primary" onClick={handleOpenDrawer}>
              <Plus size={15} aria-hidden="true" strokeWidth={2.5} />
              Novo cliente
            </Button>
          }
        />
      )}

      {/* Estado vazio — sem resultado na busca */}
      {!isLoading && !isError && clients?.length === 0 && debouncedSearch && (
        <EmptyState
          icon={Search}
          title={`Nenhum cliente encontrado para "${debouncedSearch}"`}
          description="Tente outro termo ou verifique a ortografia."
        />
      )}

      {/* ── DRAWER DE CRIAÇÃO ───────────────────────────────────────────────── */}
      {isDrawerOpen && (
        <>
          <div
            className="client-drawer-backdrop"
            onClick={handleCloseDrawer}
            aria-hidden="true"
          />
          <aside
            className="client-drawer"
            aria-label="Novo cliente"
            role="complementary"
          >
            <div className="client-drawer__header">
              <h2 className="client-drawer__title">Novo cliente</h2>
              <button
                className="client-drawer__close"
                onClick={handleCloseDrawer}
                type="button"
                aria-label="Fechar painel de criação"
              >
                ✕
              </button>
            </div>
            <div className="client-drawer__body">
              <ClientForm
                submitLabel="Criar cliente"
                onSubmit={handleCreate}
                onCancel={handleCloseDrawer}
                apiError={createError}
              />
            </div>
          </aside>
        </>
      )}

      {/* ── DIALOG DE CONFIRMAÇÃO DE EXCLUSÃO ───────────────────────────────── */}
      <ConfirmDialog
        isOpen={Boolean(clientToDelete)}
        title="Excluir cliente"
        description={
          clientToDelete
            ? `Tem certeza que deseja excluir "${clientToDelete.name}"? Esta ação é irreversível e removerá também todos os atendimentos vinculados.`
            : ''
        }
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setClientToDelete(null);
          setDeleteError(null);
        }}
        isLoading={deleteClient.isPending}
      />

      {/* Erro de exclusão — exibido como alert após fechar o dialog */}
      {deleteError && !clientToDelete && (
        <Alert variant="error">{deleteError}</Alert>
      )}
    </div>
  );
}
