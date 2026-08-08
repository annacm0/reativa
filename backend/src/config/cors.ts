import { CorsOptions } from 'cors';
import { env } from './env';

export const corsOptions: CorsOptions = {
  // Somente o frontend cadastrado pode fazer requisições
  origin: env.FRONTEND_URL,

  // Métodos HTTP permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  // Headers que o frontend pode enviar (Authorization é necessário para o JWT)
  allowedHeaders: ['Content-Type', 'Authorization'],

  // Permite enviar cookies e headers de autenticação
  credentials: true,
};
