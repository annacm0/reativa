import { Request, Response, NextFunction } from 'express';
import * as clientService from './client.service';
import {
  createClientSchema,
  updateClientSchema,
  clientIdParamSchema,
  listClientQuerySchema,
} from './client.schema';

// ──────────────────────────────────────────────────────────────
// req.user é garantido pelo middleware authenticate em todas as rotas.
// companyId e role NUNCA são lidos do body — sempre de req.user.
// ──────────────────────────────────────────────────────────────

/**
 * GET /api/clients
 * GET /api/clients?search=ana
 * Lista clientes da empresa autenticada, com busca opcional por nome.
 */
export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companyId } = req.user!;
    const { search } = listClientQuerySchema.parse(req.query);

    const clients = await clientService.list(companyId, search);

    res.status(200).json(clients);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/clients/:id
 * Retorna um cliente pelo ID, verificando pertencimento à empresa.
 */
export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companyId } = req.user!;
    const { id } = clientIdParamSchema.parse(req.params);

    const client = await clientService.getById(id, companyId);

    res.status(200).json(client);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/clients
 * Cria um novo cliente para a empresa autenticada.
 */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companyId } = req.user!;
    const data = createClientSchema.parse(req.body);

    const client = await clientService.create(data, companyId);

    res.status(201).json(client);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/clients/:id
 * Atualiza campos de um cliente. Apenas os campos enviados são alterados.
 */
export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companyId } = req.user!;
    const { id } = clientIdParamSchema.parse(req.params);
    const data = updateClientSchema.parse(req.body);

    const client = await clientService.update(id, companyId, data);

    res.status(200).json(client);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/clients/:id
 * Remove um cliente e seus atendimentos (cascade). Restrito a ADMIN.
 */
export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companyId } = req.user!;
    const { id } = clientIdParamSchema.parse(req.params);

    await clientService.remove(id, companyId);

    res.status(200).json({ message: 'Cliente removido com sucesso' });
  } catch (err) {
    next(err);
  }
}
