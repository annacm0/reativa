import { Prisma } from '@prisma/client';
import { AppError } from '../../middlewares/error.middleware';
import * as serviceRepository from './service.repository';
import type { CreateServiceInput, UpdateServiceInput } from './service.schema';

// ──────────────────────────────────────────────────────────────
// Códigos de erro do Prisma usados neste módulo:
//   P2002 — unique constraint violation (nome duplicado na empresa)
//   P2003 — foreign key constraint (Restrict: serviço tem atendimentos)
// ──────────────────────────────────────────────────────────────

/**
 * Lista serviços da empresa com busca opcional por nome.
 */
export async function list(companyId: string, search?: string) {
  return serviceRepository.findAll(companyId, search || undefined);
}

/**
 * Retorna um serviço pelo ID.
 * 404 genérico — não revela se o ID pertence a outra empresa.
 */
export async function getById(id: string, companyId: string) {
  const service = await serviceRepository.findById(id, companyId);

  if (!service) {
    throw new AppError('Serviço não encontrado', 404);
  }

  return service;
}

/**
 * Cria um novo serviço para a empresa autenticada.
 * Retorna 409 se já existir um serviço com o mesmo nome na empresa.
 */
export async function create(data: CreateServiceInput, companyId: string) {
  try {
    return await serviceRepository.create({
      name: data.name,
      returnIntervalDays: data.returnIntervalDays,
      durationMinutes: data.durationMinutes,
      companyId, // ← sempre da empresa autenticada
    });
  } catch (err) {
    // P2002: violação do @@unique([companyId, name])
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(`Já existe um serviço com o nome "${data.name}" nesta empresa`, 409);
    }
    throw err;
  }
}

/**
 * Atualiza campos de um serviço.
 *
 * Fluxo:
 *   1. Verifica que o serviço existe e pertence à empresa (getById → 404)
 *   2. Aplica apenas os campos enviados
 *   3. Retorna 409 se o novo nome duplicar outro serviço da empresa
 */
export async function update(
  id: string,
  companyId: string,
  data: UpdateServiceInput
) {
  // Garante ownership antes de alterar
  await getById(id, companyId);

  const updateData: Parameters<typeof serviceRepository.update>[1] = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.returnIntervalDays !== undefined) updateData.returnIntervalDays = data.returnIntervalDays;
  if (data.durationMinutes !== undefined) updateData.durationMinutes = data.durationMinutes;

  try {
    return await serviceRepository.update(id, updateData);
  } catch (err) {
    // P2002: novo nome já existe em outro serviço da mesma empresa
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(`Já existe um serviço com o nome "${data.name}" nesta empresa`, 409);
    }
    throw err;
  }
}

/**
 * Remove um serviço.
 *
 * IMPORTANTE: se o serviço tiver atendimentos registrados, o banco recusa
 * a exclusão (onDelete: Restrict no schema). Retornamos 409 com mensagem
 * explicando que é necessário remover os atendimentos primeiro.
 *
 * Essa proteção evita que dados históricos fiquem órfãos.
 */
export async function remove(id: string, companyId: string) {
  // Verifica ownership antes de tentar deletar
  await getById(id, companyId);

  try {
    return await serviceRepository.remove(id);
  } catch (err) {
    // P2003: foreign key constraint — serviço tem atendimentos vinculados
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      throw new AppError(
        'Este serviço possui atendimentos registrados e não pode ser removido. ' +
        'Remova os atendimentos vinculados antes de excluir o serviço.',
        409
      );
    }
    throw err;
  }
}
