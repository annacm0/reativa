import { Router } from 'express';
import { authorize } from '../../middlewares/authorize.middleware';
import * as clientController from './client.controller';

// authenticate é aplicado no nível do router raiz (routes/index.ts)
// Aqui definimos apenas as rotas e as permissões por role
const router = Router();

// GET /api/clients          → lista todos (com busca opcional ?search=)
// GET /api/clients?search=  → busca por nome (ADMIN e MEMBER)
router.get('/', clientController.list);

// POST /api/clients         → cria novo cliente (ADMIN e MEMBER)
router.post('/', clientController.create);

// GET /api/clients/:id      → detalhe do cliente (ADMIN e MEMBER)
router.get('/:id', clientController.getById);

// PUT /api/clients/:id      → atualiza cliente (ADMIN e MEMBER)
router.put('/:id', clientController.update);

// DELETE /api/clients/:id   → remove cliente + atendimentos (somente ADMIN)
// A exclusão é irreversível e destrói o histórico de atendimentos em cascata
router.delete('/:id', authorize('ADMIN'), clientController.remove);

export { router as clientRoutes };
