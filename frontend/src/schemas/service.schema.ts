/**
 * schemas/service.schema.ts — Validação Zod dos formulários de Serviço
 *
 * Campos numéricos — estratégia:
 *   Inputs HTML do tipo "number" retornam string para o RHF quando vazios.
 *   Com `valueAsNumber: true` no register, campos vazios chegam como NaN.
 *
 *   returnIntervalDays (obrigatório):
 *     z.number() com invalid_type_error captura o NaN do campo vazio.
 *
 *   durationMinutes (opcional):
 *     z.preprocess() converte NaN → undefined antes do Zod validar.
 *     Assim, campo vazio passa a validação opcional sem erro.
 *
 * O frontend valida apenas para feedback imediato.
 * O backend (Zod + Prisma) é a fonte de verdade para validação definitiva.
 */

import { z } from 'zod';

// ── CRIAÇÃO ────────────────────────────────────────────────────────────────

export const createServiceSchema = z.object({
  name: z
    .string()
    .min(1, 'Informe o nome do serviço')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),

  returnIntervalDays: z
    .number({
      // invalid_type_error é disparado quando o campo está vazio (NaN via valueAsNumber)
      invalid_type_error: 'Informe o intervalo de retorno em dias',
    })
    .int('Deve ser um número inteiro de dias')
    .min(1, 'Mínimo 1 dia')
    .max(3650, 'Máximo 3650 dias (10 anos)'),

  // preprocess: NaN (campo vazio) → undefined → passa a validação opcional
  durationMinutes: z.preprocess(
    (val) => {
      if (typeof val === 'number' && isNaN(val)) return undefined;
      if (val === '' || val === null) return undefined;
      return val;
    },
    z
      .number({ invalid_type_error: 'Informe a duração em minutos' })
      .int('Deve ser um número inteiro')
      .min(1, 'Mínimo 1 minuto')
      .max(1440, 'Máximo 1440 minutos (24h)')
      .optional()
  ) as z.ZodType<number | undefined>,
});

// ── EDIÇÃO ─────────────────────────────────────────────────────────────────

export const updateServiceSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),

  returnIntervalDays: z
    .number({ invalid_type_error: 'Informe o intervalo de retorno em dias' })
    .int('Deve ser um número inteiro de dias')
    .min(1, 'Mínimo 1 dia')
    .max(3650, 'Máximo 3650 dias (10 anos)')
    .optional(),

  durationMinutes: z.preprocess(
    (val) => {
      if (typeof val === 'number' && isNaN(val)) return undefined;
      if (val === '' || val === null) return undefined;
      return val;
    },
    z
      .number({ invalid_type_error: 'Informe a duração em minutos' })
      .int('Deve ser um número inteiro')
      .min(1, 'Mínimo 1 minuto')
      .max(1440, 'Máximo 1440 minutos (24h)')
      .optional()
      .nullable()
  ) as z.ZodType<number | null | undefined>,
});

// ── TIPOS INFERIDOS ────────────────────────────────────────────────────────

export type CreateServiceFormData = z.infer<typeof createServiceSchema>;
export type UpdateServiceFormData = z.infer<typeof updateServiceSchema>;
