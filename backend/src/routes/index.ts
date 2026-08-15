import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { clientRoutes } from '../modules/clients/client.routes';
import { serviceRoutes } from '../modules/services/service.routes';
import { authenticate } from '../middlewares/authenticate.middleware';

// Roteador raiz — prefixo /api definido em server.ts
const router = Router();

// ── Saúde ────────────────────────────────────────────────────
// GET /api/health — pública, sem autenticação
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Reativa API está funcionando ✅',
  });
});

// ── Autenticação (rotas públicas) ─────────────────────────────
// POST /api/auth/register
// POST /api/auth/login
router.use('/auth', authRoutes);

// ── Módulos protegidos ────────────────────────────────────────
// authenticate é aplicado aqui, uma vez, para todos os módulos abaixo.
// Nenhum controller precisa verificar o token — já foi validado.
router.use('/clients', authenticate, clientRoutes);
router.use('/services', authenticate, serviceRoutes);

// ── Próximos módulos (adicionados nas ETAPAs seguintes) ──────
// router.use('/appointments', authenticate, appointmentRoutes);
// router.use('/retention',    authenticate, retentionRoutes);

export { router };
