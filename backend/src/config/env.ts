import { z } from 'zod';
import dotenv from 'dotenv';

// Carrega o arquivo .env para process.env
dotenv.config();

// Define o esquema de validação das variáveis de ambiente
// Se qualquer variável obrigatória estiver faltando, o processo encerra com erro claro
const envSchema = z.object({
  // Banco de dados
  DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),

  // JWT
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Servidor — z.coerce converte string do .env para number automaticamente
  PORT: z.coerce.number().positive().default(3333),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // CORS
  FRONTEND_URL: z.string().url('FRONTEND_URL deve ser uma URL válida'),
});

// Valida as variáveis e encerra o processo se algo estiver errado
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1); // Encerra o servidor com código de erro
}

// Exporta as variáveis já validadas e tipadas
export const env = parsed.data;
