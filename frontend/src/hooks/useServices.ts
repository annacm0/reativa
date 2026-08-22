/**
 * useServices.ts — TanStack Query para o módulo Serviços
 *
 * Mesmo padrão do useClients.ts.
 * Páginas e componentes NUNCA chamam services.service.ts diretamente.
 *
 * Invalidação de cache:
 *   Criar/excluir → invalida toda a query ['services']
 *   Editar        → invalida ['services'] (lista + detalhe via superconjunto)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as servicesService from '../services/services.service';
import type { CreateServicePayload, UpdateServicePayload } from '../services/services.service';

export const SERVICES_KEY = 'services' as const;

// ── QUERIES ────────────────────────────────────────────────────────────────

export function useServices(search?: string) {
  return useQuery({
    queryKey: [SERVICES_KEY, { search: search ?? '' }],
    queryFn: () => servicesService.list(search || undefined),
    staleTime: 30_000,
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: [SERVICES_KEY, id],
    queryFn: () => servicesService.getById(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

// ── MUTATIONS ──────────────────────────────────────────────────────────────

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServicePayload) => servicesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
    },
  });
}

export function useUpdateService(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateServicePayload) => servicesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
    },
  });
}
