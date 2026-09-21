/**
 * schemas/client.schema.ts — Validação Zod dos formulários de Cliente
 *
 * Estratégia:
 *   Os schemas do frontend são MENOS restritivos que os do backend.
 *   Objetivo: feedback imediato para erros óbvios (campo vazio, formato claramente inválido).
 *   O backend é a fonte de verdade para validação definitiva.
 *
 * Telefone:
 *   Aceita qualquer formato que contenha ≥ 10 dígitos (DDD + número).
 *   Não normaliza — o backend faz isso. Não bloqueia formatos intermediários.
 *
 * Email:
 *   Opcional. String vazia é tratada como "não informado" pelo service.
 *   z.literal('') permite que o campo passe vazio sem erro de "email inválido".
 */

import { z } from 'zod';

// ── CRIAÇÃO ────────────────────────────────────────────────────────────────

export const createClientSchema = z.object({
  name: z
    .string()
    .min(1, 'Informe o nome do cliente')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),

  phone: z
    .string()
    .min(1, 'Informe o telefone com DDD')
    .refine(
      (val) => val.replace(/\D/g, '').length >= 10,
      'Telefone incompleto. Ex: (11) 99999-9999'
    ),

  // Aceita email válido OU string vazia (campo não preenchido)
  email: z
    .string()
    .email('Digite um email válido')
    .optional()
    .or(z.literal('')),

  notes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional(),
});

// ── EDIÇÃO ─────────────────────────────────────────────────────────────────
// Todos os campos são opcionais — enviamos apenas o que mudou.

export const updateClientSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),

  phone: z
    .string()
    .refine(
      (val) => val.replace(/\D/g, '').length >= 10,
      'Informe DDD + número (mínimo 10 dígitos)'
    )
    .optional(),

  email: z
    .string()
    .email('Digite um email válido')
    .optional()
    .or(z.literal(''))
    .nullable(),

  notes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
    .nullable(),
});

// ── TIPOS INFERIDOS ────────────────────────────────────────────────────────

export type CreateClientFormData = z.infer<typeof createClientSchema>;
export type UpdateClientFormData = z.infer<typeof updateClientSchema>;
