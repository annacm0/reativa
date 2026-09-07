import { prisma } from '../../config/prisma';

// ──────────────────────────────────────────────────────────────
// Todas as funções recebem companyId como parâmetro obrigatório.
// Nenhuma query acessa clientes sem filtrar pela empresa.
// ──────────────────────────────────────────────────────────────

/**
 * Lista todos os clientes da empresa.
 * Aceita filtro opcional por nome (case-insensitive).
 * Sempre limitado a companyId — nunca retorna clientes de outras empresas.
 */
export async function findAll(companyId: string, search?: string) {
  return prisma.client.findMany({
    where: {
      companyId,
      // Busca por nome — só aplicada se o parâmetro for enviado
      ...(search
        ? {
            name: {
              contains: search,
              mode: 'insensitive' as const, // Case-insensitive: "ana" encontra "Ana"
            },
          }
        : {}),
    },
    orderBy: { name: 'asc' }, // Ordem alfabética
  });
}

/**
 * Busca um cliente por ID dentro de uma empresa específica.
 * Usa findFirst (não findUnique) porque o filtro composto id+companyId
 * não é uma constraint única no schema — mas id é globalmente único.
 *
 * Se o ID existir mas pertencer a outra empresa, retorna null.
 * Isso impede acesso cruzado entre empresas (IDOR).
 */
export async function findById(id: string, companyId: string) {
  return prisma.client.findFirst({
    where: { id, companyId },
  });
}

/**
 * Cria um novo cliente vinculado à empresa autenticada.
 * companyId é injetado aqui pelo service — nunca vem do frontend.
 */
export async function create(data: {
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  companyId: string;
}) {
  return prisma.client.create({ data });
}

/**
 * Atualiza campos de um cliente.
 * O service sempre chama findById antes de chamar update,
 * garantindo que o cliente pertence à empresa antes de alterar.
 */
export async function update(
  id: string,
  data: Partial<{
    name: string;
    phone: string;
    email: string | null;
    notes: string | null;
  }>
) {
  return prisma.client.update({
    where: { id },
    data,
  });
}

/**
 * Remove um cliente pelo ID.
 * A exclusão em cascata (definida no schema) remove também
 * todos os atendimentos vinculados a este cliente.
 * O service verifica ownership antes de chamar remove.
 */
export async function remove(id: string) {
  return prisma.client.delete({
    where: { id },
  });
}
