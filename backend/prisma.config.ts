import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

// No Prisma 7, a URL de conexão é definida aqui, não no schema.prisma.
// Este arquivo deve ficar na raiz do backend/ para ser encontrado automaticamente.
// O dotenv/config carrega o .env do diretório atual (backend/.env).

export default defineConfig({
  earlyAccess: true,
  schema: path.resolve(__dirname, 'prisma/schema.prisma'),

  // URL de conexão com o banco de dados
  datasource: {
    url: env('DATABASE_URL'),
  },
});
