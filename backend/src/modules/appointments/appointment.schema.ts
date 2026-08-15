import { z } from 'zod';

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
  date: z.coerce
    .date({ error: 'Data inválida. Use o formato ISO: "2026-08-15"' })
    .refine(
      (d) => d <= new Date(),
      'A data do atendimento não pode ser no futuro. Appointment registra atendimentos já realizados.'
    ),

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
