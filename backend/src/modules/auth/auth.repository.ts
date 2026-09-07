import { prisma } from '../../config/prisma';

// ──────────────────────────────────────────────────────────────
// Este é o único arquivo do módulo auth que acessa o banco.
// O service chama o repository — o controller nunca acessa o banco diretamente.
// ──────────────────────────────────────────────────────────────

/**
 * Busca um usuário pelo email.
 * Retorna o usuário completo (incluindo password hash) para o service
 * poder fazer a comparação. O controller NUNCA deve receber o hash.
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Cria empresa e usuário ADMIN em uma única transação atômica.
 *
 * Atômico significa: se qualquer etapa falhar, o banco faz rollback
 * de TUDO automaticamente — não existirão empresas sem usuário.
 *
 * @param data - dados já validados pelo schema e com senha já hasheada
 */
export async function createCompanyAndUser(data: {
  companyName: string;
  segment?: string;
  name: string;
  email: string;
  hashedPassword: string;
}) {
  return prisma.$transaction(async (tx) => {
    // 1. Cria a empresa primeiro
    const company = await tx.company.create({
      data: {
        name: data.companyName,
        segment: data.segment ?? null,
      },
    });

    // 2. Cria o usuário vinculado à empresa recém-criada
    // companyId vem da empresa criada acima — nunca do input externo
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.hashedPassword, // já é um hash bcrypt
        role: 'ADMIN',                 // primeiro usuário sempre é ADMIN
        companyId: company.id,         // ← da transação, não do frontend
      },
    });

    return { company, user };
  });
}
