import { RETURN_WINDOW_DAYS } from '../../config/retention.config';
import { ReturnStatus, calculateReturnInfo } from '../../utils/date.utils';
import {
  generateWhatsAppLink,
  generateRetentionMessage,
} from '../../utils/whatsapp.utils';
import { findAllAppointmentsDesc } from './retention.repository';

// ──────────────────────────────────────────────────────────────
// Tipo de retorno do motor de reativação
// Cada entry representa o estado atual de um par (cliente + serviço)
// ──────────────────────────────────────────────────────────────
export type RetentionEntry = {
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  returnIntervalDays: number;
  lastAppointmentDate: Date;
  expectedReturnDate: Date;
  daysUntilReturn: number;
  status: ReturnStatus;
  whatsappLink: string; // Link wa.me com mensagem pré-preenchida
};

// Ordem de prioridade para classificação na resposta
// ATRASADO primeiro — são os mais urgentes para reativação
const STATUS_ORDER: Record<ReturnStatus, number> = {
  ATRASADO: 0,
  PROXIMO: 1,
  NORMAL: 2,
};

/**
 * Motor de Reativação — função principal.
 *
 * Algoritmo:
 *   1. Busca todos os atendimentos da empresa ordenados por date DESC
 *   2. Percorre a lista mantendo um Map<"clientId:serviceId", RetentionEntry>
 *      — a ordem DESC garante que o primeiro encontrado por par é o mais recente
 *      — pares já vistos são ignorados (deduplicação)
 *   3. Para cada par único: calcula expectedReturnDate, daysUntilReturn, status
 *   4. Gera o link do WhatsApp com mensagem personalizada
 *   5. Filtra por status (opcional)
 *   6. Ordena: ATRASADO → PROXIMO → NORMAL, e dentro de cada grupo
 *      por daysUntilReturn ASC (os mais urgentes primeiro)
 *
 * Isolamento multi-tenant:
 *   companyId vem sempre de req.user — nunca do body ou query params.
 *
 * Extensão futura por empresa (sem alterar este motor):
 *   Recuperar company.returnWindowDays do banco e passar como windowDays.
 *   Ex: const window = company.returnWindowDays ?? RETURN_WINDOW_DAYS;
 *       calculateReturnInfo(date, interval, window);
 */
export async function getRetentionList(
  companyId: string,
  filters?: { status?: ReturnStatus }
): Promise<RetentionEntry[]> {
  // ── 1. Busca todos os atendimentos (mais recente primeiro) ───
  const appointments = await findAllAppointmentsDesc(companyId);

  // ── 2. Deduplicação: um entry por (clientId, serviceId) ──────
  const seen = new Map<string, RetentionEntry>();

  for (const appt of appointments) {
    const key = `${appt.clientId}:${appt.serviceId}`;

    // Já temos o mais recente para este par — ignorar o restante
    if (seen.has(key)) continue;

    // ── 3. Calcular retorno previsto e classificar status ──────
    const { expectedReturnDate, daysUntilReturn, status } = calculateReturnInfo(
      appt.date,
      appt.service.returnIntervalDays,
      RETURN_WINDOW_DAYS // MVP: constante global. Futuro: por empresa
    );

    // ── 4. Gerar link do WhatsApp com mensagem personalizada ───
    const message = generateRetentionMessage(appt.client.name, appt.service.name);
    const whatsappLink = generateWhatsAppLink(appt.client.phone, message);

    seen.set(key, {
      clientId: appt.clientId,
      clientName: appt.client.name,
      clientPhone: appt.client.phone,
      serviceId: appt.serviceId,
      serviceName: appt.service.name,
      returnIntervalDays: appt.service.returnIntervalDays,
      lastAppointmentDate: appt.date,
      expectedReturnDate,
      daysUntilReturn,
      status,
      whatsappLink,
    });
  }

  // ── 5. Converter Map para array e aplicar filtro opcional ────
  let results = Array.from(seen.values());

  if (filters?.status) {
    results = results.filter((r) => r.status === filters.status);
  }

  // ── 6. Ordenação: mais urgentes primeiro ─────────────────────
  // Primário: ATRASADO (0) → PROXIMO (1) → NORMAL (2)
  // Secundário: daysUntilReturn ASC (menos dias = mais urgente)
  results.sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    return a.daysUntilReturn - b.daysUntilReturn;
  });

  return results;
}
