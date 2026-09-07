import { z } from 'zod';

// No Zod v4, a chave para mensagens de campo obrigatório é 'error', não 'required_error'

// ──────────────────────────────────────────────────────────────
// Schema de REGISTRO
// ──────────────────────────────────────────────────────────────
export const registerSchema = z.object({
  companyName: z
    .string({ error: 'Nome da empresa é obrigatório' })
    .min(2, 'Nome da empresa deve ter pelo menos 2 caracteres')
    .max(100, 'Nome da empresa deve ter no máximo 100 caracteres')
    .trim(),

  segment: z
    .string()
    .max(50, 'Segmento deve ter no máximo 50 caracteres')
    .trim()
    .optional(),

  name: z
    .string({ error: 'Nome é obrigatório' })
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),

  email: z
    .string({ error: 'Email é obrigatório' })
    .email('Email inválido')
    .toLowerCase(),

  password: z
    .string({ error: 'Senha é obrigatória' })
    .min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

// ──────────────────────────────────────────────────────────────
// Schema de LOGIN
// ──────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string({ error: 'Email é obrigatório' })
    .email('Email inválido')
    .toLowerCase(),

  password: z
    .string({ error: 'Senha é obrigatória' })
    .min(1, 'Senha é obrigatória'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
