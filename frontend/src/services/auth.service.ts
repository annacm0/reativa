/**
 * services/auth.service.ts — Chamadas aos endpoints de autenticação
 *
 * RESPONSABILIDADES:
 *   ✓ Faz POST /api/auth/register e /api/auth/login
 *   ✓ Retorna AuthResponse tipado
 *   ✓ Transforma erros de rede/API em mensagens amigáveis ao usuário
 *   ✗ Não armazena token — isso é responsabilidade do AuthContext
 *   ✗ Não replica regras de negócio do backend
 *   ✗ Não utiliza companyId do frontend
 */

import { isAxiosError } from 'axios';
import api from './api';
import type { AuthResponse } from '../types/api';

// ── TIPOS DE ENTRADA ──────────────────────────────────────────────────────────
// Espelham os schemas do backend — apenas os campos que o backend espera.
// confirmPassword NÃO está aqui — é validação exclusiva do frontend.

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  companyName: string;
  segment?: string;
  name: string;
  email: string;
  password: string;
}

// ── EXTRAÇÃO DE ERRO ──────────────────────────────────────────────────────────
// Transforma erros da API em mensagens compreensíveis ao usuário.
// Nunca expõe stack trace, código de status ou detalhes técnicos.
function extractErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    // Erro de rede — sem resposta do servidor
    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
    }

    // Mensagem de erro retornada pelo backend (campo "error" do JSON)
    const serverMessage = error.response.data?.error;
    if (typeof serverMessage === 'string' && serverMessage.length > 0) {
      return serverMessage;
    }
  }

  return fallback;
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Retorna { token, user } — o AuthContext armazena e gerencia esses dados.
export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, 'Não foi possível fazer login. Tente novamente.')
    );
  }
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Cria empresa + primeiro usuário ADMIN e retorna { token, user }.
// companyId não é enviado — o backend cria e associa automaticamente.
export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  } catch (error) {
    throw new Error(
      extractErrorMessage(error, 'Não foi possível criar sua conta. Tente novamente.')
    );
  }
}
