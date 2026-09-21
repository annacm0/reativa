/**
 * appointments.service.ts — Camada HTTP do módulo Atendimentos
 *
 * Responsabilidades:
 *   ✓ Encapsula todas as chamadas à API de atendimentos
 *   ✓ Transforma erros Axios em mensagens amigáveis
 *   ✓ Não envia companyId — o backend extrai do JWT
 *   ✓ Não replica regras de negócio (multi-tenancy, validação de data)
 *
 * Atendimento é registro histórico imutável:
 *   ✓ Não há PUT/PATCH — sem função update() neste service
 */

import api from './api';
import type { Appointment } from '../types/api';

// ── TIPOS DE INPUT ─────────────────────────────────────────────────────────

export interface CreateAppointmentPayload {
  clientId:  string;
  serviceId: string;
  /** Formato ISO: "YYYY-MM-DD". Backend rejeita datas futuras. */
  date:      string;
  notes?:    string;
}

export interface ListAppointmentsParams {
  /** Filtra atendimentos de um cliente específico */
  clientId?:  string;
  /** Filtra atendimentos de um serviço específico */
  serviceId?: string;
  /** Máximo de registros a retornar (default backend: 50, max: 200) */
  limit?:     number;
}

// ── TRATAMENTO DE ERRO ─────────────────────────────────────────────────────

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: string } } };
    const message = axiosError.response?.data?.error;
    if (message) return message;
  }
  if (error instanceof Error && error.message && !error.message.includes('Network')) {
    return fallback;
  }
  return 'Erro de conexão. Verifique sua internet e tente novamente.';
}

// ── OPERAÇÕES ──────────────────────────────────────────────────────────────

/**
 * Lista atendimentos da empresa autenticada.
 * Passa limit=200 por padrão para evitar truncamento silencioso no frontend.
 * Paginação é evolução futura — não esconde registros arbitrariamente.
 */
export async function list(params?: ListAppointmentsParams): Promise<Appointment[]> {
  try {
    const query: Record<string, string | number> = {
      limit: params?.limit ?? 200,
    };
    if (params?.clientId)  query.clientId  = params.clientId;
    if (params?.serviceId) query.serviceId = params.serviceId;

    const response = await api.get<Appointment[]>('/appointments', { params: query });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Não foi possível carregar os atendimentos.'));
  }
}

/**
 * Retorna um atendimento pelo ID.
 */
export async function getById(id: string): Promise<Appointment> {
  try {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Atendimento não encontrado.'));
  }
}

/**
 * Registra um atendimento realizado.
 * Backend valida que clientId e serviceId pertencem à empresa autenticada
 * e que a data não é futura — o frontend não replica essas regras.
 */
export async function create(data: CreateAppointmentPayload): Promise<Appointment> {
  const payload: Record<string, string> = {
    clientId:  data.clientId,
    serviceId: data.serviceId,
    date:      data.date,
  };

  if (data.notes?.trim()) payload.notes = data.notes.trim();

  try {
    const response = await api.post<Appointment>('/appointments', payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Não foi possível registrar o atendimento.'));
  }
}

/**
 * Remove um atendimento do histórico.
 * Restrito a ADMIN pelo backend — o frontend controla visibilidade do botão.
 */
export async function remove(id: string): Promise<void> {
  try {
    await api.delete(`/appointments/${id}`);
  } catch (error) {
    throw new Error(extractErrorMessage(error, 'Não foi possível excluir o atendimento.'));
  }
}
