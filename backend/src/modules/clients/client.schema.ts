import { z } from 'zod';

// ──────────────────────────────────────────────────────────────
// CREATE
// ──────────────────────────────────────────────────────────────
export const createClientSchema = z.object({
  name: z
    .string({ error: 'Nome é obrigatório' })
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),

  // Aceita qualquer formato legível — o service normaliza antes de salvar
  // Ex: "(11) 99999-9999", "+55 11 99999-9999", "11999999999"
  phone: z
    .string({ error: 'Telefone é obrigatório' })
    .min(1, 'Telefone é obrigatório')
    .max(20, 'Telefone inválido')
    .refine(
      (val) => val.replace(/\D/g, '').length >= 10,
      'Telefone deve ter pelo menos 10 dígitos (DDD + número)'
    ),

  email: z.string().email('Email inválido').toLowerCase().optional(),

  // Observações livres — cada negócio usa como quiser
  notes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional(),
});

// ──────────────────────────────────────────────────────────────
// UPDATE — todos os campos são opcionais
// email e notes aceitam null para serem removidos
// ──────────────────────────────────────────────────────────────
export const updateClientSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100)
    .trim()
    .optional(),

  phone: z
    .string()
    .max(20)
    .refine(
      (val) => val.replace(/\D/g, '').length >= 10,
      'Telefone deve ter pelo menos 10 dígitos'
    )
    .optional(),

  email: z.string().email('Email inválido').toLowerCase().nullable().optional(),

  notes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .nullable()
    .optional(),
});

// ──────────────────────────────────────────────────────────────
// PARAMS — valida que :id é um UUID v4 válido
// Evita queries desnecessárias ao banco com IDs malformados
// ──────────────────────────────────────────────────────────────
export const clientIdParamSchema = z.object({
  id: z.string().uuid('ID de cliente inválido'),
});

// ──────────────────────────────────────────────────────────────
// QUERY — parâmetros de listagem
// ?search=ana → busca por nome (case-insensitive, sempre dentro da empresa)
// ──────────────────────────────────────────────────────────────
export const listClientQuerySchema = z.object({
  search: z.string().trim().optional(),
});

// Tipos inferidos — usados no service e repository
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
