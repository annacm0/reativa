import { prisma } from '../../config/prisma';

// Campos de client e service incluídos em todas as respostas.
// Evita round-trips extras do frontend para buscar nomes e intervalo.
const appointmentInclude = {
  client: { select: { id: true, name: true } },
  service: { select: { id: true, name: true, returnIntervalDays: true } },
} as const;

/**
 * Lista atendimentos da empresa com filtros opcionais.
 * Ordenação: mais recente primeiro (date DESC).
 * Filtros sempre combinados com companyId — nunca expõe outra empresa.
 */
export async function findAll(
  companyId: string,
  filters?: { clientId?: string; serviceId?: string; limit?: number }
) {
  return prisma.appointment.findMany({
    where: {
      companyId,
      ...(filters?.clientId ? { clientId: filters.clientId } : {}),
      ...(filters?.serviceId ? { serviceId: filters.serviceId } : {}),
    },
    orderBy: { date: 'desc' },
    take: filters?.limit ?? 50,
    include: appointmentInclude,
  });
}

/**
 * Busca um atendimento por ID dentro da empresa.
 * Retorna null se não encontrado ou se pertencer a outra empresa (IDOR prevention).
 */
export async function findById(id: string, companyId: string) {
  return prisma.appointment.findFirst({
    where: { id, companyId },
    include: appointmentInclude,
  });
}

/**
 * Cria um atendimento.
 * companyId é injetado pelo service — nunca vem do body da request.
 * Retorna o atendimento com client e service aninhados (evita round-trip do frontend).
 */
export async function create(data: {
  clientId: string;
  serviceId: string;
  date: Date;
  notes?: string;
  companyId: string;
}) {
  return prisma.appointment.create({
    data,
    include: appointmentInclude,
  });
}

/**
 * Remove um atendimento.
 * O service verifica ownership (companyId) antes de chamar remove.
 */
export async function remove(id: string) {
  return prisma.appointment.delete({
    where: { id },
  });
}
