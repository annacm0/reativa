/**
 * services.service.ts — Camada HTTP do módulo Serviços
 *
 * Dois cenários de 409 com tratamentos distintos:
 *
 *   1. Nome duplicado (POST/PUT):
 *      Backend: "Já existe um serviço com o nome X nesta empresa" (409)
 *      Frontend: erro inline no campo "Nome" do formulário
 *
 *   2. Atendimentos vinculados (DELETE):
 *      Backend: "Este serviço possui atendimentos registrados..." (409)
 *      Frontend: Alert na listagem após o ConfirmDialog fechar
 *
 * Ambos os casos são identificados pela mensagem retornada — o frontend
 * repassa a mensagem do backend (já amigável) sem necessidade de parse.
 *
 * companyId NUNCA é enviado pelo frontend — o backend extrai do JWT.
 */

import api from './api';
import type { Service } from '../types/api';

// ── TIPOS DE INPUT ─────────────────────────────────────────────────────────

export interface CreateServicePayload {
  name: string;
  returnIntervalDays: number;
  durationMinutes?: number;
}

export interface UpdateServicePayload {
  name?: string;
  returnIntervalDays?: number;
  /** null remove o valor existente */
  durationMinutes?: number | null;
}

// ── TRATAMENTO DE ERRO ─────────────────────────────────────────────────────

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: string } } };
    const message = axiosError.response?.data?.error;
    if (message) return message;
  }
  return fallback;
}

// ── OPERAÇÕES ──────────────────────────────────────────────────────────────

/** Lista serviços da empresa autenticada. */
export async function list(search?: string): Promise<Service[]> {
  try {
    const params = search?.trim() ? { search: search.trim() } : {};
    const response = await api.get<Service[]>('/services', { params });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Não foi possível carregar os serviços.'));
  }
}

/** Retorna um serviço pelo ID. */
export async function getById(id: string): Promise<Service> {
  try {
    const response = await api.get<Service>(`/services/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Serviço não encontrado.'));
  }
}

/**
 * Cria um novo serviço.
 * Pode lançar erro com mensagem "Já existe um serviço..." em caso de nome duplicado (409).
 */
export async function create(data: CreateServicePayload): Promise<Service> {
  const payload: Record<string, unknown> = {
    name: data.name.trim(),
    returnIntervalDays: data.returnIntervalDays,
  };

  if (data.durationMinutes != null) {
    payload.durationMinutes = data.durationMinutes;
  }

  try {
    const response = await api.post<Service>('/services', payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Não foi possível criar o serviço.'));
  }
}

/**
 * Atualiza um serviço.
 * Pode lançar erro com mensagem "Já existe um serviço..." em caso de nome duplicado (409).
 */
export async function update(id: string, data: UpdateServicePayload): Promise<Service> {
  try {
    const response = await api.put<Service>(`/services/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Não foi possível salvar as alterações.'));
  }
}

/**
 * Remove um serviço.
 * Pode lançar 409 se o serviço tiver atendimentos vinculados (onDelete: Restrict).
 * A mensagem do backend já descreve a situação — repassada diretamente ao usuário.
 */
export async function remove(id: string): Promise<void> {
  try {
    await api.delete(`/services/${id}`);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Não foi possível excluir o serviço.'));
  }
}
