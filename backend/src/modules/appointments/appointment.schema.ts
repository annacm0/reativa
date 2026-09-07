import { z } from 'zod';
import { isFutureDate } from '../../utils/date.utils';

// ──────────────────────────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────────────────────────
export const createAppointmentSchema = z.object({
  clientId: z
    .string({ error: 'clientId é obrigatório' })
    .uuid('ID de cliente inválido'),

  serviceId: z
    .string({ error: 'serviceId é obrigatório' })
    .uuid('ID de serviço inválido'),

  // z.coerce.date() aceita strings ISO ("2026-08-15") e converte para Date.
  // O .refine() garante que Appointment representa apenas atendimentos realizados.
  // Datas futuras pertencem a uma funcionalidade de agendamento — fora do MVP.
  // Recebe a string ISO e valida/converte manualmente para evitar
  // o problema de timezone: z.coerce.date("2026-08-18") cria
  // 2026-08-18T00:00:00.000Z (UTC), mas getDate() em UTC-3 devolve 17.
  // Com string(), comparamos apenas os dígitos do calendário — sem conversão.
  date: z
    .string({ error: 'Data inválida. Use o formato ISO: "2026-08-15"' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida. Use o formato ISO: "2026-08-15"')
    .refine((s) => {
      const d = new Date(s + 'T00:00:00'); // local midnight — sem Z
      return !isNaN(d.getTime());
    }, 'Data inválida')
    .refine(
      // Comparação puramente por string de data (YYYY-MM-DD).
      // Não há conversão de timezone: ambas as strings representam
      // datas no mesmo calendário local.
      (s) => !isFutureDate(s),
      'A data do atendimento não pode ser no futuro. Appointment registra atendimentos já realizados.'
    )
    .transform((s) => new Date(s + 'T00:00:00')), // local midnight para o banco

  notes: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
});

// ──────────────────────────────────────────────────────────────
// QUERY — filtros de listagem
// ──────────────────────────────────────────────────────────────
export const listAppointmentQuerySchema = z.object({
  // Filtra pelo cliente — retorna histórico de atendimentos do cliente
  clientId: z.string().uuid('ID de cliente inválido').optional(),

  // Filtra pelo serviço — retorna todos os atendimentos daquele tipo
  serviceId: z.string().uuid('ID de serviço inválido').optional(),

  // Limite de registros — padrão 50, máx 200
  limit: z.coerce.number().int().min(1).max(200).default(50).optional(),
});

// ──────────────────────────────────────────────────────────────
// PARAMS
// ──────────────────────────────────────────────────────────────
export const appointmentIdParamSchema = z.object({
  id: z.string().uuid('ID de atendimento inválido'),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
