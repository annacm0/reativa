import { Router } from 'express';
import * as authController from './auth.controller';

// Rotas públicas de autenticação — não passam pelo middleware authenticate
const router = Router();

// POST /api/auth/register
// Body: { companyName, name, email, password, segment? }
// Resposta: 201 { token, user: { id, name, email, role, companyId } }
router.post('/register', authController.register);

// POST /api/auth/login
// Body: { email, password }
// Resposta: 200 { token, user: { id, name, email, role, companyId } }
router.post('/login', authController.login);

export { router as authRoutes };
