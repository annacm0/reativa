import { prisma } from '../../config/prisma';

/**
 * Busca TODOS os atendimentos da empresa, ordenados por data DESC.
 *
 * Por que todos e não o último por par?
 *   O Prisma não suporta DISTINCT ON nativamente.
 *   A deduplicação por (clientId, serviceId) é feita em memória no service,
 *   aproveitando que a ordem DESC garante que o primeiro encontrado por par
 *   é sempre o mais recente.
 *
 * Caminho de upgrade futuro (quando o volume justificar):
 *   Substituir por raw SQL com DISTINCT ON (client_id, service_id):
 *   SELECT DISTINCT ON (client_id, service_id) *
 *   FROM appointments
 *   WHERE company_id = $1
 *   ORDER BY client_id, service_id, date DESC;
 *
 * O contrato de retorno desta função não muda — só a implementação interna.
 */
export async function findAllAppointmentsDesc(companyId: string) {
  return prisma.appointment.findMany({
    where: { companyId },
    orderBy: { date: 'desc' },
    include: {
      client: {
        select: { id: true, name: true, phone: true },
      },
      service: {
        select: { id: true, name: true, returnIntervalDays: true },
      },
    },
  });
}
