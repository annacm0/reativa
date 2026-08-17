import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as retentionService from './retention.service';

// Filtro opcional por status — enum validado pelo Zod
const retentionQuerySchema = z.object({
  status: z.enum(['NORMAL', 'PROXIMO', 'ATRASADO']).optional(),
});

/**
 * GET /api/retention
 * GET /api/retention?status=ATRASADO
 * GET /api/retention?status=PROXIMO
 *
 * Retorna a lista de clientes classificados por status de retorno.
 * companyId sempre de req.user — nunca do frontend.
 * Ordenação: ATRASADO → PROXIMO → NORMAL, mais urgentes primeiro.
 */
export async function getRetentionList(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { companyId } = req.user!;
    const { status } = retentionQuerySchema.parse(req.query);

    const list = await retentionService.getRetentionList(companyId, { status });

    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
}
