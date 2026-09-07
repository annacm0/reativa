import { AppError } from '../../middlewares/error.middleware';
import { normalizePhoneNumber } from '../../utils/whatsapp.utils';
import * as clientRepository from './client.repository';
import type { CreateClientInput, UpdateClientInput } from './client.schema';

// ──────────────────────────────────────────────────────────────
// REGRA CENTRAL: companyId vem sempre de req.user — nunca do body.
// Todas as funções recebem companyId como parâmetro explícito.
// ──────────────────────────────────────────────────────────────

/**
 * Lista clientes da empresa. Aceita busca opcional por nome.
 * A busca é sempre limitada à empresa autenticada.
 */
export async function list(companyId: string, search?: string) {
  return clientRepository.findAll(companyId, search || undefined);
}

/**
 * Retorna um cliente específico.
 * Lança 404 se o cliente não existir OU se pertencer a outra empresa.
 * A mensagem é genérica — não revela se o ID pertence a outra empresa.
 */
export async function getById(id: string, companyId: string) {
  const client = await clientRepository.findById(id, companyId);

  if (!client) {
    throw new AppError('Cliente não encontrado', 404);
  }

  return client;
}

/**
 * Cria um novo cliente.
 * Normaliza o telefone antes de salvar: "(11) 99999-9999" → "5511999999999"
 * companyId é injetado aqui — nunca vem do body da request.
 */
export async function create(data: CreateClientInput, companyId: string) {
  return clientRepository.create({
    name: data.name,
    phone: normalizePhoneNumber(data.phone), // normalizado antes de persistir
    email: data.email,
    notes: data.notes,
    companyId, // ← da empresa autenticada, nunca do frontend
  });
}

/**
 * Atualiza dados de um cliente.
 *
 * Fluxo:
 *   1. Verifica que o cliente existe E pertence à empresa (getById lança 404 se não)
 *   2. Normaliza telefone se incluído na atualização
 *   3. Persiste apenas os campos enviados (undefined = não altera)
 */
export async function update(
  id: string,
  companyId: string,
  data: UpdateClientInput
) {
  // Garante ownership antes de qualquer alteração
  await getById(id, companyId);

  // Monta o objeto de atualização apenas com os campos presentes
  const updateData: Parameters<typeof clientRepository.update>[1] = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = normalizePhoneNumber(data.phone);
  if (data.email !== undefined) updateData.email = data.email; // null remove o email
  if (data.notes !== undefined) updateData.notes = data.notes; // null limpa as notas

  return clientRepository.update(id, updateData);
}

/**
 * Remove um cliente e todos os seus atendimentos (cascade no schema).
 * A operação é irreversível — restrita a ADMIN no nível de rota.
 *
 * Fluxo:
 *   1. Verifica ownership (getById lança 404 se não pertencer à empresa)
 *   2. Remove (cascade apaga atendimentos vinculados)
 */
export async function remove(id: string, companyId: string) {
  // Garante que o cliente existe e pertence à empresa antes de deletar
  await getById(id, companyId);

  return clientRepository.remove(id);
}
