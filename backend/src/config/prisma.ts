import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Padrão Singleton: garante que só existe um PrismaClient em toda a aplicação.
// Isso evita o problema de "Too many connections" com o banco de dados.

// Em desenvolvimento com hot-reload, o módulo pode ser recarregado várias vezes.
// Guardamos a instância no objeto global do Node para sobreviver ao reload.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Em desenvolvimento, loga as queries para facilitar o debug.
    // Em produção, não loga nada (evita expor dados sensíveis nos logs).
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Preserva a instância no escopo global apenas em desenvolvimento
if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
