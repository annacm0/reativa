import { Request, Response, NextFunction } from 'express';
import * as serviceService from './service.service';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceIdParamSchema,
  listServiceQuerySchema,
} from './service.schema';

/**
 * GET /api/services
 * GET /api/services?search=banho
 */
export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companyId } = req.user!;
    const { search } = listServiceQuerySchema.parse(req.query);

    const services = await serviceService.list(companyId, search);

    res.status(200).json(services);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/services/:id
 */
export async function getById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companyId } = req.user!;
    const { id } = serviceIdParamSchema.parse(req.params);

    const service = await serviceService.getById(id, companyId);

    res.status(200).json(service);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/services
 */
export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companyId } = req.user!;
    const data = createServiceSchema.parse(req.body);

    const service = await serviceService.create(data, companyId);

    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/services/:id
 */
export async function update(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companyId } = req.user!;
    const { id } = serviceIdParamSchema.parse(req.params);
    const data = updateServiceSchema.parse(req.body);

    const service = await serviceService.update(id, companyId, data);

    res.status(200).json(service);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/services/:id — restrito a ADMIN
 * Falha com 409 se o serviço tiver atendimentos vinculados.
 */
export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companyId } = req.user!;
    const { id } = serviceIdParamSchema.parse(req.params);

    await serviceService.remove(id, companyId);

    res.status(200).json({ message: 'Serviço removido com sucesso' });
  } catch (err) {
    next(err);
  }
}
