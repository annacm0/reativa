import { AppError } from '../../middlewares/error.middleware';
import { findById as findClientById } from '../clients/client.repository';
import { findById as findServiceById } from '../services/service.repository';
import * as appointmentRepository from './appointment.repository';
import type { CreateAppointmentInput } from './appointment.schema';

// ──────────────────────────────────────────────────────────────
// REGRA FUNDAMENTAL:
// companyId vem SEMPRE de req.user — nunca do body da request.
// Todas as funções recebem companyId como parâmetro explícito.
//
// VALIDAÇÃO CROSS-ENTITY:
// clientId e serviceId passados no body são UUIDs de outras entidades.
// O banco garante integridade referencial (FK válido), mas NÃO garante
// que o registro pertence à empresa autenticada.
// → A validação abaixo resolve isso buscando com (id + companyId).
// ──────────────────────────────────────────────────────────────

/**
 * Lista atendimentos da empresa com filtros opcionais.
 * Filtros clientId e serviceId também são limitados à empresa autenticada.
 */
export async function list(
  companyId: string,
  filters?: { clientId?: string; serviceId?: string; limit?: number }
) {
  return appointmentRepository.findAll(companyId, filters);
}

/**
 * Retorna um atendimento pelo ID.
 * 404 genérico — não revela se o ID pertence a outra empresa.
 */
export async function getById(id: string, companyId: string) {
  const appointment = await appointmentRepository.findById(id, companyId);

  if (!appointment) {
    throw new AppError('Atendimento não encontrado', 404);
  }

  return appointment;
}

/**
 * Cria um atendimento após validar que clientId e serviceId
 * pertencem à empresa autenticada.
 *
 * Fluxo de segurança:
 *   1. Valida clientId  → findFirst({ id: clientId, companyId })
 *      → null: AppError 404 "Cliente não encontrado"
 *      (mesmo erro para "não existe" e "pertence a outra empresa" — sem IDOR)
 *
 *   2. Valida serviceId → findFirst({ id: serviceId, companyId })
 *      → null: AppError 404 "Serviço não encontrado"
 *
 *   3. Cria o Appointment com companyId do token — nunca do body
 */
export async function create(
  data: CreateAppointmentInput,
  companyId: string
) {
  // ── Validação cross-entity: clientId ──────────────────────────
  const client = await findClientById(data.clientId, companyId);
  if (!client) {
    throw new AppError('Cliente não encontrado', 404);
  }

  // ── Validação cross-entity: serviceId ─────────────────────────
  const service = await findServiceById(data.serviceId, companyId);
  if (!service) {
    throw new AppError('Serviço não encontrado', 404);
  }

  // ── Criação com companyId injetado ────────────────────────────
  // client e service validados acima garantem que o appointment
  // está dentro do tenant correto
  return appointmentRepository.create({
    clientId: data.clientId,
    serviceId: data.serviceId,
    date: data.date,
    notes: data.notes,
    companyId, // ← da empresa autenticada, nunca do frontend
  });
}

/**
 * Remove um atendimento.
 * Verifica ownership antes de deletar (getById lança 404 se não for da empresa).
 */
export async function remove(id: string, companyId: string) {
  await getById(id, companyId);
  return appointmentRepository.remove(id);
}
