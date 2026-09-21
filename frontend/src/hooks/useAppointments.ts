/**
 * useAppointments.ts — TanStack Query para o módulo Atendimentos
 *
 * Centraliza todas as queries e mutations de atendimentos.
 * Páginas e componentes NUNCA chamam appointments.service.ts diretamente.
 *
 * Invalidação de cache:
 *   Criar/excluir → invalida toda a query ['appointments']
 *
 * staleTime: 30s — dados ficam "frescos" por 30 segundos.
 *
 * Atendimento é imutável:
 *   Não há useUpdateAppointment — sem PUT/PATCH no backend.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as appointmentsService from '../services/appointments.service';
import type {
  CreateAppointmentPayload,
  ListAppointmentsParams,
} from '../services/appointments.service';

// Chave base — todas as queries de atendimentos começam com esse valor
export const APPOINTMENTS_KEY = 'appointments' as const;

// ── QUERIES ────────────────────────────────────────────────────────────────

/**
 * Lista atendimentos. Aceita filtros opcionais (clientId, serviceId, limit).
 * queryKey inclui os params para que filtros diferentes sejam caches independentes.
 */
export function useAppointments(params?: ListAppointmentsParams) {
  return useQuery({
    queryKey: [APPOINTMENTS_KEY, params ?? {}],
    queryFn: () => appointmentsService.list(params),
    staleTime: 30_000,
  });
}

// ── MUTATIONS ──────────────────────────────────────────────────────────────

/** Registra um atendimento. Após sucesso, atualiza a lista. */
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointmentPayload) => appointmentsService.create(data),
    onSuccess: () => {
      // Invalida todas as queries de atendimentos (qualquer conjunto de filtros)
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
    },
  });
}

/** Remove um atendimento. Após sucesso, atualiza a lista. */
export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => appointmentsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_KEY] });
    },
  });
}
