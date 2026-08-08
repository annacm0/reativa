import { Router } from 'express';

// Importações das rotas por domínio (serão criadas nas próximas etapas)
// import { authRoutes } from './auth.routes';
// import { clientRoutes } from './client.routes';
// import { petRoutes } from './pet.routes';
// import { serviceRoutes } from './service.routes';
// import { appointmentRoutes } from './appointment.routes';
// import { retentionRoutes } from './retention.routes';

const router = Router();

// Rota de saúde — útil para verificar se a API está online
// GET /health → { status: 'ok', timestamp: '...' }
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Reativa API está funcionando ✅',
  });
});

// As rotas serão registradas aqui conforme as etapas avançam:
// router.use('/auth', authRoutes);
// router.use('/clients', clientRoutes);
// router.use('/pets', petRoutes);
// router.use('/services', serviceRoutes);
// router.use('/appointments', appointmentRoutes);
// router.use('/retention', retentionRoutes);

export { router };
