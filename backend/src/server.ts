import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { corsOptions } from './config/cors';
import { router } from './routes/index';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

// ────────────────────────────────────────────────────────────
// SEGURANÇA — middlewares aplicados em TODAS as requisições
// ────────────────────────────────────────────────────────────

// Helmet: adiciona ~15 headers HTTP de segurança automaticamente
// Ex: X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security
app.use(helmet());

// CORS: define quais origens podem acessar esta API
app.use(cors(corsOptions));

// Rate Limiting: limita a 100 requisições por IP a cada 15 minutos
// Protege contra ataques de força bruta e DDoS simples
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos em milissegundos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas requisições. Tente novamente em alguns minutos.',
  },
});
app.use(limiter);

// ────────────────────────────────────────────────────────────
// PARSING — interpreta o body das requisições
// ────────────────────────────────────────────────────────────

// Permite receber JSON no body (ex: { "email": "...", "password": "..." })
app.use(express.json({ limit: '10kb' })); // Limite para evitar payloads gigantes

// Permite receber dados de formulários HTML
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ────────────────────────────────────────────────────────────
// ROTAS
// ────────────────────────────────────────────────────────────

// Todas as rotas da API ficam sob o prefixo /api
// Ex: GET /api/health, POST /api/auth/login, GET /api/clients
app.use('/api', router);

// Rota para qualquer URL não mapeada
app.use((_req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// ────────────────────────────────────────────────────────────
// TRATAMENTO DE ERROS — deve ser o ÚLTIMO middleware
// ────────────────────────────────────────────────────────────
app.use(errorMiddleware);

// ────────────────────────────────────────────────────────────
// INICIALIZAÇÃO DO SERVIDOR
// ────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log(`\n🚀 Reativa API iniciada`);
  console.log(`   Porta:    ${env.PORT}`);
  console.log(`   Ambiente: ${env.NODE_ENV}`);
  console.log(`   URL:      http://localhost:${env.PORT}/api/health\n`);
});

export { app };
