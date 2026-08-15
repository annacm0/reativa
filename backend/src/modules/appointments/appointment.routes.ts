import { Router } from 'express';
import { authorize } from '../../middlewares/authorize.middleware';
import * as appointmentController from './appointment.controller';

// authenticate é aplicado no nível do router raiz (routes/index.ts)
const router = Router();

// GET /api/appointments             → lista atendimentos (filtros: ?clientId=, ?serviceId=, ?limit=)
// GET /api/appointments?clientId=   → histórico de um cliente (ADMIN e MEMBER)
router.get('/', appointmentController.list);

// POST /api/appointments            → registra atendimento realizado (ADMIN e MEMBER)
// Rejeita datas futuras e valida clientId + serviceId na empresa autenticada
router.post('/', appointmentController.create);

// GET /api/appointments/:id         → detalhe do atendimento (ADMIN e MEMBER)
router.get('/:id', appointmentController.getById);

// DELETE /api/appointments/:id      → remove do histórico (somente ADMIN)
router.delete('/:id', authorize('ADMIN'), appointmentController.remove);

export { router as appointmentRoutes };
