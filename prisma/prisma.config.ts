import path from 'node:path';
import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

// Carrega o .env do diretório backend
// O prisma.config.ts fica na raiz /prisma, então navegamos até /backend/.env
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

export default defineConfig({
  earlyAccess: true,
  schema: path.resolve(__dirname, 'schema.prisma'),
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg');
      const connectionString = process.env.DATABASE_URL;

      if (!connectionString) {
        throw new Error('DATABASE_URL não definida no .env');
      }

      return new PrismaPg({ connectionString });
    },
  },
});
