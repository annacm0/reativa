import { Router } from 'express';
import { authorize } from '../../middlewares/authorize.middleware';
import * as serviceController from './service.controller';

// authenticate é aplicado no nível do router raiz (routes/index.ts)
const router = Router();

// GET /api/services           → lista todos (com busca opcional ?search=)
// GET /api/services?search=   → busca por nome (ADMIN e MEMBER)
router.get('/', serviceController.list);

// POST /api/services          → cria novo serviço (ADMIN e MEMBER)
router.post('/', serviceController.create);

// GET /api/services/:id       → detalhe do serviço (ADMIN e MEMBER)
router.get('/:id', serviceController.getById);

// PUT /api/services/:id       → atualiza serviço (ADMIN e MEMBER)
router.put('/:id', serviceController.update);

// DELETE /api/services/:id    → remove serviço (somente ADMIN)
// Falha com 409 se o serviço possuir atendimentos vinculados (onDelete: Restrict)
router.delete('/:id', authorize('ADMIN'), serviceController.remove);

export { router as serviceRoutes };
