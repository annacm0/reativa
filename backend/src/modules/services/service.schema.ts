import { z } from 'zod';

// ──────────────────────────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────────────────────────
export const createServiceSchema = z.object({
  name: z
    .string({ error: 'Nome do serviço é obrigatório' })
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),

  // Intervalo esperado de retorno — alimenta o motor de recuperação
  // Ex: Banho → 30, Coloração → 60, Revisão anual → 365
  returnIntervalDays: z
    .number({ error: 'Intervalo de retorno é obrigatório' })
    .int('Intervalo deve ser um número inteiro de dias')
    .min(1, 'Intervalo deve ser de pelo menos 1 dia')
    .max(3650, 'Intervalo deve ser de no máximo 3650 dias (10 anos)'),

  // Duração em minutos — informativo, usado para agenda futura
  durationMinutes: z
    .number()
    .int('Duração deve ser um número inteiro de minutos')
    .min(1, 'Duração deve ser de pelo menos 1 minuto')
    .max(1440, 'Duração deve ser de no máximo 1440 minutos (24h)')
    .optional(),
});

// ──────────────────────────────────────────────────────────────
// UPDATE — todos os campos são opcionais
// ──────────────────────────────────────────────────────────────
export const updateServiceSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100)
    .trim()
    .optional(),

  returnIntervalDays: z
    .number()
    .int('Intervalo deve ser um número inteiro de dias')
    .min(1, 'Intervalo deve ser de pelo menos 1 dia')
    .max(3650)
    .optional(),

  durationMinutes: z
    .number()
    .int('Duração deve ser um número inteiro de minutos')
    .min(1)
    .max(1440)
    .nullable()
    .optional(),
});

// ──────────────────────────────────────────────────────────────
// PARAMS — valida que :id é um UUID v4 válido
// ──────────────────────────────────────────────────────────────
export const serviceIdParamSchema = z.object({
  id: z.string().uuid('ID de serviço inválido'),
});

// ──────────────────────────────────────────────────────────────
// QUERY — busca opcional por nome
// ──────────────────────────────────────────────────────────────
export const listServiceQuerySchema = z.object({
  search: z.string().trim().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
