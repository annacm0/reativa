import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';

// Roteador raiz — prefixo /api definido em server.ts
// Cada módulo de domínio tem seu próprio arquivo de rotas
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

// ── Autenticação ─────────────────────────────────────────────
// POST /api/auth/register
// POST /api/auth/login
router.use('/auth', authRoutes);

// ── Próximos módulos (adicionados nas ETAPAs seguintes) ──────
// router.use('/clients',      authenticate, clientRoutes);
// router.use('/services',     authenticate, serviceRoutes);
// router.use('/appointments', authenticate, appointmentRoutes);
// router.use('/retention',    authenticate, retentionRoutes);

export { router };
