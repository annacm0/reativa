import { AppError } from '../../middlewares/error.middleware';
import { hashPassword, comparePassword } from '../../utils/hash.utils';
import { generateToken } from '../../utils/jwt.utils';
import { findUserByEmail, createCompanyAndUser } from './auth.repository';
import type { RegisterInput, LoginInput } from './auth.schema';

// Hash fictício usado no login quando o usuário não é encontrado.
// Garante que o bcrypt.compare sempre seja executado, tornando o tempo
// de resposta constante — impede ataques de timing que distinguiriam
// "usuário não existe" de "senha errada" pelo tempo de resposta.
const DUMMY_HASH = '$2b$12$invalidhashfortimingneutralizationpadding123456';

// Estrutura de retorno pública — nunca inclui o hash da senha
type AuthResult = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MEMBER';
    companyId: string;
  };
};

// ──────────────────────────────────────────────────────────────
// REGISTRO
// ──────────────────────────────────────────────────────────────

/**
 * Registra uma nova empresa com seu primeiro usuário administrador.
 *
 * Fluxo:
 *   1. Verifica se o email já está em uso
 *   2. Gera o hash da senha
 *   3. Cria empresa + usuário numa transação atômica
 *   4. Retorna token JWT e dados públicos do usuário
 */
export async function register(data: RegisterInput): Promise<AuthResult> {
  // Verificar duplicidade de email antes de iniciar a transação
  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    throw new AppError('Este email já está cadastrado', 409);
  }

  // Hash da senha com bcrypt (12 rounds — definido em hash.utils.ts)
  const hashedPassword = await hashPassword(data.password);

  // Criação atômica: se o user.create falhar, o company.create é revertido
  const { user } = await createCompanyAndUser({
    companyName: data.companyName,
    segment: data.segment,
    name: data.name,
    email: data.email,
    hashedPassword,
  });

  const token = generateToken({
    userId: user.id,
    companyId: user.companyId,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
  };
}

// ──────────────────────────────────────────────────────────────
// LOGIN
// ──────────────────────────────────────────────────────────────

/**
 * Autentica um usuário existente.
 *
 * SEGURANÇA: a mensagem de erro é idêntica para email inexistente
 * e senha incorreta. Isso impede que um atacante descubra quais
 * emails estão cadastrados no sistema (enumeração de usuários).
 */
export async function login(data: LoginInput): Promise<AuthResult> {
  const user = await findUserByEmail(data.email);

  // Sempre executa comparePassword — mesmo quando o usuário não existe.
  // Isso iguala o tempo de resposta nos dois cenários (timing neutralization).
  const hash = user?.password ?? DUMMY_HASH;
  const isPasswordValid = await comparePassword(data.password, hash);

  if (!user || !isPasswordValid) {
    // Mesma mensagem para ambos os casos — não revela qual falhou
    throw new AppError('Email ou senha inválidos', 401);
  }

  const token = generateToken({
    userId: user.id,
    companyId: user.companyId,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
  };
}
