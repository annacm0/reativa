import { prisma } from '../../config/prisma';

// ──────────────────────────────────────────────────────────────
// Todas as funções recebem companyId como parâmetro obrigatório.
// ──────────────────────────────────────────────────────────────

/**
 * Lista todos os serviços da empresa.
 * Aceita filtro opcional por nome (case-insensitive).
 */
export async function findAll(companyId: string, search?: string) {
  return prisma.service.findMany({
    where: {
      companyId,
      ...(search
        ? {
            name: {
              contains: search,
              mode: 'insensitive' as const,
            },
          }
        : {}),
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * Busca um serviço por ID dentro da empresa.
 * Retorna null se não encontrado ou se pertencer a outra empresa (IDOR prevention).
 */
export async function findById(id: string, companyId: string) {
  return prisma.service.findFirst({
    where: { id, companyId },
  });
}

/**
 * Cria um novo serviço.
 * durationMinutes é Int? — omitir quando undefined deixa o campo como null no banco.
 * Lança P2002 (unique constraint) se já existir serviço com mesmo nome na empresa.
 */
export async function create(data: {
  name: string;
  returnIntervalDays: number;
  durationMinutes?: number;
  companyId: string;
}) {
  return prisma.service.create({
    data: {
      name: data.name,
      returnIntervalDays: data.returnIntervalDays,
      companyId: data.companyId,
      // Omite o campo quando undefined — Prisma salva null para Int? sem default
      ...(data.durationMinutes !== undefined
        ? { durationMinutes: data.durationMinutes }
        : {}),
    },
  });
}

/**
 * Atualiza campos de um serviço.
 * durationMinutes: null → remove o valor (limpa o campo)
 * O service verifica ownership antes de chamar update.
 */
export async function update(
  id: string,
  data: Partial<{
    name: string;
    returnIntervalDays: number;
    durationMinutes: number | null; // null limpa o campo (Int? permite isso)
  }>
) {
  return prisma.service.update({
    where: { id },
    data,
  });
}

/**
 * Remove um serviço.
 * Lança P2003 (Restrict) se o serviço tiver atendimentos vinculados.
 * O service captura P2003 e retorna AppError 409.
 */
export async function remove(id: string) {
  return prisma.service.delete({
    where: { id },
  });
}
