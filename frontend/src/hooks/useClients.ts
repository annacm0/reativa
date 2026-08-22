/**
 * useClients.ts — TanStack Query para o módulo Clientes
 *
 * Centraliza todas as queries e mutations de clientes.
 * Páginas e componentes NUNCA chamam clients.service.ts diretamente.
 *
 * Invalidação de cache:
 *   Criar/excluir → invalida toda a query ['clients'] (re-fetch da lista)
 *   Editar        → invalida ['clients'] e ['clients', id] (lista + detalhe)
 *
 * staleTime: 30s — dados ficam "frescos" por 30 segundos.
 * Evita re-fetch desnecessário ao navegar entre páginas rapidamente.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as clientsService from '../services/clients.service';
import type { CreateClientPayload, UpdateClientPayload } from '../services/clients.service';

// Chave base — todas as queries de clientes começam com esse array
export const CLIENTS_KEY = 'clients' as const;

// ── QUERIES ────────────────────────────────────────────────────────────────

/**
 * Lista clientes. Aceita termo de busca (debounced pelo caller).
 * queryKey inclui o search para que buscas diferentes sejam caches separados.
 */
export function useClients(search?: string) {
  return useQuery({
    queryKey: [CLIENTS_KEY, { search: search ?? '' }],
    queryFn: () => clientsService.list(search || undefined),
    staleTime: 30_000,
  });
}

/**
 * Detalhe de um cliente pelo ID.
 * enabled: false quando id é falsy (página carregando o param da URL).
 */
export function useClient(id: string) {
  return useQuery({
    queryKey: [CLIENTS_KEY, id],
    queryFn: () => clientsService.getById(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

// ── MUTATIONS ──────────────────────────────────────────────────────────────

/** Cria um cliente. Após sucesso, atualiza a lista. */
export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientPayload) => clientsService.create(data),
    onSuccess: () => {
      // Invalida todas as queries de listagem (qualquer search)
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY] });
    },
  });
}

/** Atualiza um cliente. Após sucesso, atualiza lista e detalhe. */
export function useUpdateClient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateClientPayload) => clientsService.update(id, data),
    onSuccess: () => {
      // Invalida listagem + detalhe deste cliente
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY] });
    },
  });
}

/** Remove um cliente. Após sucesso, atualiza a lista. */
export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_KEY] });
    },
  });
}
