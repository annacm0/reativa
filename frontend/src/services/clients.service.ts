/**
 * clients.service.ts — Camada HTTP do módulo Clientes
 *
 * Responsabilidades:
 *   ✓ Encapsula todas as chamadas à API de clientes
 *   ✓ Transforma erros Axios em mensagens amigáveis
 *   ✓ Não envia companyId — o backend extrai do JWT
 *   ✓ Não replica regras de negócio (normalização de telefone, multi-tenancy)
 *
 * Padrão de erro:
 *   Erros de API (4xx/5xx) → mensagem do campo error da resposta
 *   Erros de rede/timeout  → mensagem genérica de conexão
 *   O caller (mutation/query) decide como exibir o erro
 */

import api from './api';
import type { Client } from '../types/api';

// ── TIPOS DE INPUT ─────────────────────────────────────────────────────────
// Espelham o contrato de input do backend.
// Separados da interface Client (que é a resposta) para clareza.

export interface CreateClientPayload {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface UpdateClientPayload {
  name?: string;
  phone?: string;
  /** null remove o email existente */
  email?: string | null;
  /** null remove as notas existentes */
  notes?: string | null;
}

// ── TRATAMENTO DE ERRO ─────────────────────────────────────────────────────

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: string } } };
    const message = axiosError.response?.data?.error;
    if (message) return message;
  }
  if (error instanceof Error && error.message && !error.message.includes('Network')) {
    // Não expõe mensagens técnicas de rede ao usuário
    return fallback;
  }
  return 'Erro de conexão. Verifique sua internet e tente novamente.';
}

// ── OPERAÇÕES ──────────────────────────────────────────────────────────────

/**
 * Lista clientes da empresa autenticada.
 * Passa ?search= apenas quando há termo de busca.
 */
export async function list(search?: string): Promise<Client[]> {
  try {
    const params = search?.trim() ? { search: search.trim() } : {};
    const response = await api.get<Client[]>('/clients', { params });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Não foi possível carregar os clientes.'));
  }
}

/**
 * Retorna um cliente pelo ID.
 * O backend retorna 404 se o ID não existir ou pertencer a outra empresa.
 */
export async function getById(id: string): Promise<Client> {
  try {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Cliente não encontrado.'));
  }
}

/**
 * Cria um novo cliente.
 *
 * email e notes são omitidos do payload quando vazios — o backend
 * os trata como opcionais. Não enviamos null para criação.
 *
 * O telefone é enviado como digitado — o backend normaliza antes de persistir.
 */
export async function create(data: CreateClientPayload): Promise<Client> {
  // Monta o payload omitindo campos opcionais vazios
  const payload: Record<string, string> = {
    name: data.name.trim(),
    phone: data.phone,
  };

  if (data.email?.trim()) payload.email = data.email.trim();
  if (data.notes?.trim()) payload.notes = data.notes.trim();

  try {
    const response = await api.post<Client>('/clients', payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Não foi possível criar o cliente.'));
  }
}

/**
 * Atualiza um cliente existente.
 *
 * Envia apenas os campos incluídos no payload.
 * null é válido para email e notes (remove o valor).
 * phone é enviado como digitado — backend normaliza.
 */
export async function update(id: string, data: UpdateClientPayload): Promise<Client> {
  try {
    const response = await api.put<Client>(`/clients/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Não foi possível salvar as alterações.'));
  }
}

/**
 * Remove um cliente e todos os seus atendimentos (cascade).
 * Restrito a ADMIN pelo backend — o frontend controla visibilidade do botão.
 */
export async function remove(id: string): Promise<void> {
  try {
    await api.delete(`/clients/${id}`);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Não foi possível excluir o cliente.'));
  }
}
