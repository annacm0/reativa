/**
 * appointment.schema.ts — Validação Zod do formulário de Atendimentos
 *
 * Validações de UX (não substituem o backend):
 *   ✓ Campos obrigatórios com mensagens em português
 *   ✓ Data no formato correto (YYYY-MM-DD via input[type=date])
 *   ✓ Data não futura — camada de UX antes do backend rejeitar
 *   ✓ notes opcional, máx 500 chars
 */

import { z } from 'zod';

/**
 * Retorna a data de hoje no formato YYYY-MM-DD (horário local, sem timezone).
 * Evita o problema de UTC: new Date().toISOString() pode retornar o dia anterior
 * em fusos horários negativos (ex: America/Sao_Paulo às 21h retornaria UTC do dia seguinte).
 */
export function todayISO(): string {
  const d = new Date();
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const createAppointmentSchema = z.object({
  clientId: z
    .string({ required_error: 'Selecione um cliente' })
    .min(1, 'Selecione um cliente')
    .uuid('Selecione um cliente válido'),

  serviceId: z
    .string({ required_error: 'Selecione um serviço' })
    .min(1, 'Selecione um serviço')
    .uuid('Selecione um serviço válido'),

  date: z
    .string({ required_error: 'Informe a data do atendimento' })
    .min(1, 'Informe a data do atendimento')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Selecione uma data válida')
    .refine(
      (d) => d <= todayISO(),
      'Não é possível registrar atendimentos em datas futuras'
    ),

  notes: z
    .string()
    .max(500, 'Máximo de 500 caracteres')
    .optional(),
});

export type CreateAppointmentFormData = z.infer<typeof createAppointmentSchema>;
