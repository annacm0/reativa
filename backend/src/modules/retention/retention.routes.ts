import { Router } from 'express';
import * as retentionController from './retention.controller';

// authenticate é aplicado no nível do router raiz (routes/index.ts)
// Motor de reativação é somente leitura — sem POST, PUT ou DELETE
const router = Router();

// GET /api/retention              → lista todos (NORMAL, PROXIMO, ATRASADO)
// GET /api/retention?status=      → filtra por status específico
router.get('/', retentionController.getRetentionList);

export { router as retentionRoutes };
