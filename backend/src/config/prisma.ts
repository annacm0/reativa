import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { env } from './env';

// No Prisma 7, a conexão é feita via adapter (não mais pela url no schema).
// O PrismaPg cria um pool de conexões com o PostgreSQL.

// Padrão Singleton: garante que só existe um PrismaClient em toda a aplicação.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
  });

  return new PrismaClient({
    adapter,
    // Em desenvolvimento, loga as queries para facilitar o debug.
    // Em produção, apenas erros (nunca expõe dados sensíveis em logs).
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Preserva a instância no escopo global apenas em desenvolvimento (hot-reload)
if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
