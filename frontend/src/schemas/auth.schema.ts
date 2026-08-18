/**
 * schemas/auth.schema.ts — Validação Zod dos formulários de autenticação
 *
 * Os schemas do frontend são INTENCIONALMENTE menos restritivos que os do backend.
 * Objetivo: feedback imediato ao usuário para erros óbvios (campo vazio, formato inválido).
 * O backend é a fonte de verdade para validações de negócio (ex: email único).
 *
 * POR QUÊ confirmPassword está aqui mas não no backend:
 *   É uma validação de UX — evitar que o usuário cometa erro de digitação.
 *   O auth.service.ts extrai e descarta confirmPassword antes de chamar a API.
 */

import { z } from 'zod';

// ── LOGIN ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe seu email')
    .email('Digite um email válido'),

  password: z
    .string()
    .min(1, 'Informe sua senha'),
});

// ── CADASTRO ──────────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    companyName: z
      .string()
      .min(1, 'Informe o nome da empresa')
      .min(2, 'Nome da empresa deve ter pelo menos 2 caracteres')
      .max(100, 'Nome da empresa deve ter no máximo 100 caracteres'),

    segment: z
      .string()
      .max(50, 'Segmento deve ter no máximo 50 caracteres')
      .optional(),

    name: z
      .string()
      .min(1, 'Informe seu nome')
      .min(2, 'Seu nome deve ter pelo menos 2 caracteres')
      .max(100, 'Seu nome deve ter no máximo 100 caracteres'),

    email: z
      .string()
      .min(1, 'Informe seu email')
      .email('Digite um email válido'),

    password: z
      .string()
      .min(1, 'Informe uma senha')
      .min(8, 'A senha deve ter pelo menos 8 caracteres'),

    confirmPassword: z
      .string()
      .min(1, 'Confirme sua senha'),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'As senhas não coincidem',
      // Aponta o erro para o campo confirmPassword
      path: ['confirmPassword'],
    }
  );

// ── TIPOS INFERIDOS ───────────────────────────────────────────────────────────
// Usados pelo React Hook Form (useForm<LoginFormData>) para tipagem dos campos

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
